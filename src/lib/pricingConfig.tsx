import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface PriceOverride {
  norKit?: number;
  norVial?: number;
  chnKit?: number;
  chnVial?: number;
}

export interface PricingMarkups {
  norKitPct: number;
  chnKitPct: number;
  chnVialUSPct: number;
  chnVialDirPct: number;
}

export interface PricingConfig {
  markups: PricingMarkups;
  overrides: Record<string, PriceOverride>;
}

export const DEFAULT_PRICING: PricingConfig = {
  markups: { norKitPct: 15, chnKitPct: 65, chnVialUSPct: 65, chnVialDirPct: 65 },
  overrides: {},
};

export async function savePricingConfig(config: PricingConfig): Promise<void> {
  await setDoc(doc(db, 'settings', 'pricingConfig'), {
    markups: config.markups,
    overrides: config.overrides,
  });
}

const PricingContext = createContext<PricingConfig>(DEFAULT_PRICING);

export function PricingProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'pricingConfig'),
      snap => { if (snap.exists()) setConfig(snap.data() as PricingConfig); },
      () => {}
    );
    return unsub;
  }, []);

  return <PricingContext.Provider value={config}>{children}</PricingContext.Provider>;
}

export function usePricingConfig(): PricingConfig {
  return useContext(PricingContext);
}
