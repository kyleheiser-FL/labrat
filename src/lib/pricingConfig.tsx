import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { db, auth } from '../firebase';
import { fetchCustomerPriceBook } from './pricingApi';

export interface PriceOverride {
  norKit?: number;
  norVial?: number;
  chnKit?: number;
  chnVial?: number;
}

export interface PricingMarkups {
  norKitPct: number;
  /** Optional — when absent, Norway vials fall back to the product list price */
  norVialPct?: number;
  chnKitPct: number;
  chnVialUSPct: number;
  chnVialDirPct: number;
}

// Final sell prices computed server-side (markups + overrides already applied).
// Wholesale costs never reach the client.
export interface ProductPrices {
  norKit?: number;
  norVial?: number;
  chnKit?: number;
  chnVial?: number;
}

export interface PricingConfig {
  markups: PricingMarkups;
  overrides: Record<string, PriceOverride>;
  priceBook?: Record<string, ProductPrices>;
  priceStatus?: 'loading' | 'ready' | 'error';
  /** Ask the server to also price product names beyond the built-in catalog */
  ensureNames?: (names: string[]) => void;
}

export const DEFAULT_PRICING: PricingConfig = {
  markups: { norKitPct: 15, chnKitPct: 65, chnVialUSPct: 65, chnVialDirPct: 1525 },
  overrides: {},
};

const ADMIN_EMAIL = 'kyleheiser@gmail.com';
const PRICE_BOOK_CACHE_KEY = 'labrat_verified_customer_price_book_v1';
const PRICE_BOOK_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function loadCachedPriceBook(): Record<string, ProductPrices> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PRICE_BOOK_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { fetchedAt?: number; priceBook?: Record<string, ProductPrices> };
    if (!cached.fetchedAt || Date.now() - cached.fetchedAt > PRICE_BOOK_CACHE_MAX_AGE_MS) return null;
    if (!cached.priceBook || Object.keys(cached.priceBook).length === 0) return null;
    return cached.priceBook;
  } catch {
    return null;
  }
}

function cachePriceBook(priceBook: Record<string, ProductPrices>): void {
  if (typeof window === 'undefined' || Object.keys(priceBook).length === 0) return;
  try {
    window.localStorage.setItem(PRICE_BOOK_CACHE_KEY, JSON.stringify({
      fetchedAt: Date.now(),
      priceBook,
    }));
  } catch { /* private browsing or full storage — live prices still work */ }
}

export async function savePricingConfig(config: { markups: PricingMarkups; overrides: Record<string, PriceOverride> }): Promise<void> {
  await setDoc(doc(db, 'systemConfig', 'pricingConfig'), {
    markups: config.markups,
    overrides: config.overrides,
  });
}

const PricingContext = createContext<PricingConfig>(DEFAULT_PRICING);

export function PricingProvider({ children }: { children: ReactNode }) {
  const [cachedPriceBook] = useState(loadCachedPriceBook);
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING);
  const [priceBook, setPriceBook] = useState<Record<string, ProductPrices>>(cachedPriceBook || {});
  const [priceStatus, setPriceStatus] = useState<'loading' | 'ready' | 'error'>(cachedPriceBook ? 'ready' : 'loading');
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [configVersion, setConfigVersion] = useState(0);
  const extraNames = useRef<Set<string>>(new Set());
  const priceBookRef = useRef<Record<string, ProductPrices>>(cachedPriceBook || {});
  const [namesVersion, setNamesVersion] = useState(0);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  // Markups/overrides are admin-only in Firestore; members rely solely on the
  // server-computed price book. The snapshot doubles as a live-refresh trigger.
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(
      doc(db, 'systemConfig', 'pricingConfig'),
      snap => {
        if (snap.exists()) setConfig(snap.data() as PricingConfig);
        setConfigVersion(v => v + 1);
      },
      err => console.error('[pricing] Failed to load pricing config:', err)
    );
    return unsub;
  }, [isAdmin]);

  // Fetch final sell prices from the server
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const nextPriceBook = await fetchCustomerPriceBook(user, [...extraNames.current]);
        if (!cancelled) {
          priceBookRef.current = nextPriceBook;
          setPriceBook(nextPriceBook);
          setPriceStatus('ready');
          cachePriceBook(nextPriceBook);
        }
      } catch (e) {
        console.error('[pricing] Failed to fetch price book — shop prices may be incomplete:', e);
        // A previously verified book is safe to keep showing while offline.
        if (!cancelled && Object.keys(priceBookRef.current).length === 0) setPriceStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [user, configVersion, namesVersion]);

  const ensureNames = useCallback((names: string[]) => {
    let added = false;
    for (const n of names) {
      if (n && !priceBookRef.current[n] && !extraNames.current.has(n)) {
        extraNames.current.add(n);
        added = true;
      }
    }
    if (added) setNamesVersion(v => v + 1);
  }, []);

  const value = useMemo<PricingConfig>(
    () => ({ ...config, priceBook, priceStatus, ensureNames }),
    [config, priceBook, priceStatus, ensureNames]
  );

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function PricingGate({ children }: { children: ReactNode }) {
  const { priceStatus = 'loading', priceBook = {} } = usePricingConfig();

  if (priceStatus !== 'ready' || Object.keys(priceBook).length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-sm text-slate-300">
        {priceStatus === 'loading'
          ? 'Loading current prices…'
          : 'Current prices are temporarily unavailable. Please refresh to try again.'}
      </div>
    );
  }

  return children;
}

export function usePricingConfig(): PricingConfig {
  return useContext(PricingContext);
}
