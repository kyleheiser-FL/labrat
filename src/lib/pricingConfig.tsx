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
  /** Ask the server to also price product names beyond the built-in catalog */
  ensureNames?: (names: string[]) => void;
}

export const DEFAULT_PRICING: PricingConfig = {
  markups: { norKitPct: 15, chnKitPct: 65, chnVialUSPct: 65, chnVialDirPct: 1525 },
  overrides: {},
};

const ADMIN_EMAIL = 'kyleheiser@gmail.com';

export async function savePricingConfig(config: { markups: PricingMarkups; overrides: Record<string, PriceOverride> }): Promise<void> {
  await setDoc(doc(db, 'systemConfig', 'pricingConfig'), {
    markups: config.markups,
    overrides: config.overrides,
  });
}

const PricingContext = createContext<PricingConfig>(DEFAULT_PRICING);

export function PricingProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING);
  const [priceBook, setPriceBook] = useState<Record<string, ProductPrices>>({});
  const [priceStatus, setPriceStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [configVersion, setConfigVersion] = useState(0);
  const extraNames = useRef<Set<string>>(new Set());
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
          setPriceBook(nextPriceBook);
          setPriceStatus('ready');
        }
      } catch (e) {
        console.error('[pricing] Failed to fetch price book — shop prices may be incomplete:', e);
        if (!cancelled) setPriceStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [user, configVersion, namesVersion]);

  const ensureNames = useCallback((names: string[]) => {
    let added = false;
    for (const n of names) {
      if (n && !extraNames.current.has(n)) { extraNames.current.add(n); added = true; }
    }
    if (added) setNamesVersion(v => v + 1);
  }, []);

  const value = useMemo<PricingConfig>(
    () => ({ ...config, priceBook, ensureNames }),
    [config, priceBook, ensureNames]
  );

  if (priceStatus !== 'ready') {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-sm text-slate-300">
        {priceStatus === 'loading'
          ? 'Loading current prices…'
          : 'Current prices are temporarily unavailable. Please refresh to try again.'}
      </div>
    );
  }

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricingConfig(): PricingConfig {
  return useContext(PricingContext);
}
