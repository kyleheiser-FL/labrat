import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { db, auth } from '../firebase';

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
  markups: { norKitPct: 15, chnKitPct: 65, chnVialUSPct: 65, chnVialDirPct: 65 },
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
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ names: [...extraNames.current] }),
        });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        if (!cancelled && data.priceBook) setPriceBook(data.priceBook);
      } catch (e) {
        console.error('[pricing] Failed to fetch price book — shop prices may be incomplete:', e);
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

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricingConfig(): PricingConfig {
  return useContext(PricingContext);
}
