// ─────────────────────────────────────────────────────────────────────────────
// Server-only pricing data. Wholesale costs live HERE so they never ship in
// the client bundle. The client gets only computed sell prices via /api/prices;
// raw costs are served to the admin via /api/wholesale.
// ─────────────────────────────────────────────────────────────────────────────
import { SAMPLE_INVENTORY } from '../src/data/shopInventory';

export interface PricingMarkups {
  norKitPct: number;
  /** Optional — when absent, Norway vials fall back to the product list price */
  norVialPct?: number;
  chnKitPct: number;
  chnVialUSPct: number;
  chnVialDirPct: number;
}

export interface PriceOverride {
  norKit?: number;
  norVial?: number;
  chnKit?: number;
  chnVial?: number;
}

export const DEFAULT_MARKUPS: PricingMarkups = {
  norKitPct: 15, chnKitPct: 65, chnVialUSPct: 65, chnVialDirPct: 65,
};

// Returns the raw Kaos Labs kit cost (10 vials, no shipping). 0 = unrecognised product.
function resolveKitCost(norm: string): number {
  let kitCost = 0;
  if (norm.includes('bacteriostatic water') || norm.includes('bac water')) {
    if (norm.includes('10ml')) kitCost = 150;
    else kitCost = 125;
  } else if (norm.includes('bpc-157') && norm.includes('tb-500') && norm.includes('blend')) {
    // Norway/KaosLabs sells: 10mg and 20mg
    if (norm.includes('20mg')) kitCost = 325;
    else if (norm.includes('10mg')) kitCost = 225;
  } else if (norm.includes('bpc-157')) {
    // Norway/KaosLabs sells: 10mg only
    if (norm.includes('10mg')) kitCost = 185;
  } else if (norm.includes('tb-500')) {
    // Norway/KaosLabs sells: 10mg only
    if (norm.includes('10mg')) kitCost = 255;
  } else if (norm.includes('retatrutide')) {
    if (norm.includes('100mg')) kitCost = 995;
    else if (norm.includes('60mg')) kitCost = 555;
    else if (norm.includes('50mg')) kitCost = 475;
    else if (norm.includes('30mg')) kitCost = 315;
    else if (norm.includes('20mg')) kitCost = 295;
    else if (norm.includes('10mg')) kitCost = 215;
    else kitCost = 190;
  } else if (norm.includes('tirzepatide')) {
    // Norway/KaosLabs sells: 10, 15, 20, 30, 40, 60, 70, 120mg
    if (norm.includes('120mg')) kitCost = 525;
    else if (norm.includes('70mg')) kitCost = 415;
    else if (norm.includes('60mg')) kitCost = 380;
    else if (norm.includes('40mg')) kitCost = 329;
    else if (norm.includes('30mg')) kitCost = 300;
    else if (norm.includes('20mg')) kitCost = 255;
    else if (norm.includes('15mg')) kitCost = 215;
    else if (norm.includes('10mg')) kitCost = 185;
  } else if (norm.includes('semaglutide')) {
    if (norm.includes('60mg')) kitCost = 320;
    else if (norm.includes('50mg')) kitCost = 280;
    else if (norm.includes('30mg')) kitCost = 240;
    else if (norm.includes('20mg')) kitCost = 210;
    else if (norm.includes('15mg')) kitCost = 185;
    else if (norm.includes('10mg')) kitCost = 160;
    else kitCost = 65;
  } else if (norm.includes('cjc-1295') && norm.includes('ipamorelin')) {
    // Norway/KaosLabs sells: 10mg only
    if (norm.includes('10mg')) kitCost = 255;
  } else if (norm.includes('cjc-1295')) {
    // Norway/KaosLabs sells: 5mg and 10mg
    if (norm.includes('10mg')) kitCost = 320;
    else if (norm.includes('5mg')) kitCost = 295;
  } else if (norm.includes('ipamorelin')) {
    // Norway/KaosLabs sells: 10mg only
    if (norm.includes('10mg')) kitCost = 190;
  } else if (norm.includes('tesamorelin')) {
    if (norm.includes('10mg')) kitCost = 290;
    else kitCost = 230;
  } else if (norm.includes('cagrilintide')) {
    // Norway/KaosLabs sells: 5mg and 10mg only
    if (norm.includes('10mg')) kitCost = 285;
    else if (norm.includes('5mg')) kitCost = 205;
  } else if (norm.includes('sermorelin')) {
    if (norm.includes('10mg')) kitCost = 280;
    else kitCost = 210;
  } else if (norm.includes('aod-9604')) {
    if (norm.includes('10mg')) kitCost = 100;
    else kitCost = 70;
  } else if (norm.includes('klow')) {
    kitCost = 310;
  } else if (norm.includes('glow')) {
    if (norm.includes('70mg')) kitCost = 330;
    else kitCost = 295;
  } else if (norm.includes('ghk-cu') || norm.includes('copper peptide')) {
    // Norway/KaosLabs sells: 50mg and 100mg only
    if (norm.includes('100mg')) kitCost = 225;
    else if (norm.includes('50mg')) kitCost = 185;
  } else if (norm.includes('melanotan ii') || norm.includes('melanotan 2')) {
    kitCost = 230;
  } else if (norm.includes('melanotan')) {
    kitCost = 200;
  } else if (norm.includes('mazdutide')) {
    kitCost = 295;
  } else if (norm.includes('igf-1') || norm.includes('igf1')) {
    kitCost = 315;
  } else if (norm.includes('pt-141') || norm.includes('bremelanotide')) {
    kitCost = 190;
  } else if (norm.includes('nad+')) {
    // Norway/KaosLabs only sells 500mg NAD+; 1000mg+ are China-only
    if (!norm.includes('1000mg') && !norm.includes('2000mg')) kitCost = 185;
  } else if (norm.includes('mots-c')) {
    // Norway/KaosLabs sells: 10mg and 40mg only
    if (norm.includes('40mg')) kitCost = 330;
    else if (norm.includes('10mg')) kitCost = 210;
  } else if (norm.includes('ss-31') || norm.includes('elamipretide')) {
    if (norm.includes('50mg')) kitCost = 415;
    else kitCost = 210;
  } else if (norm.includes('thymosin alpha')) {
    kitCost = 230;
  } else if (norm.includes('semax') && norm.includes('selank')) {
    kitCost = 0; // Blend is China-only; Norway sells them individually
  } else if (norm.includes('selank')) {
    kitCost = 210;
  } else if (norm.includes('semax')) {
    kitCost = 180;
  } else if (norm.includes('epitalon')) {
    kitCost = 210;
  } else if (norm.includes('dsip')) {
    if (norm.includes('10mg')) kitCost = 235;
    else kitCost = 165;
  } else if (norm.includes('slu-pp') || norm.includes('slupp')) {
    kitCost = 220;
  } else if (norm.includes('snap-8')) {
    kitCost = 185;
  } else if (norm.includes('5-amino') || norm.includes('1mq')) {
    // Norway/KaosLabs sells: 10mg only
    if (norm.includes('10mg')) kitCost = 170;
  } else if (norm.includes('arachidonic') || norm.includes('ara ')) {
    kitCost = 170;
  } else if (norm.includes('lemon bottle')) {
    kitCost = 200;
  } else if (norm.includes('kpv')) {
    kitCost = 205;
  }
  return kitCost;
}

// China US Warehouse cost — only matches explicit "us warehouse" products
function resolveChineseUsWarehouseCost(norm: string): number {
  if (!norm.includes('us warehouse')) return 0;
  if (norm.includes('retatrutide')) {
    if (norm.includes('30mg')) return 210;
    if (norm.includes('20mg')) return 170;
    if (norm.includes('10mg')) return 110;
  }
  return 0;
}

// Explicit per-kit supply costs (10 vials) keyed by exact lowercased product
// name. Source: lab supply list. Customer prices derive from these via markup;
// raw costs never reach the client.
const SUPPLY_KIT_COST: Record<string, number> = {
  "semaglutide (5mg)": 41,
  "semaglutide (10mg)": 51,
  "semaglutide (15mg)": 59,
  "semaglutide (20mg)": 64,
  "semaglutide (30mg)": 79,
  "retatrutide (5mg)": 54,
  "retatrutide (10mg)": 79,
  "retatrutide (15mg)": 104,
  "retatrutide (20mg)": 121,
  "retatrutide (30mg)": 164,
  "retatrutide (40mg)": 204,
  "retatrutide (50mg)": 244,
  "retatrutide (60mg)": 284,
  "retatrutide (100mg)": 409,
  "tirzepatide (5mg)": 46,
  "tirzepatide (10mg)": 54,
  "tirzepatide (15mg)": 66,
  "tirzepatide (20mg)": 79,
  "tirzepatide (30mg)": 104,
  "tirzepatide (40mg)": 124,
  "tirzepatide (50mg)": 154,
  "tirzepatide (60mg)": 171,
  "tirzepatide (80mg)": 259,
  "tirzepatide (100mg)": 284,
  "cagrilintide (5mg)": 120,
  "cagrilintide (10mg)": 179,
  "cagrilintide (20mg)": 284,
  "survodutide (10mg)": 284,
  "mazdutide (15mg)": 309,
  "aod-9604 (5mg)": 96,
  "aod-9604 (10mg)": 171,
  "hgh fragment 176-191 (5mg)": 96,
  "cjc-1295 with dac (2mg)": 96,
  "cjc-1295 with dac (5mg)": 164,
  "cjc-1295 without dac (5mg)": 84,
  "cjc-1295 without dac (10mg)": 159,
  "cjc-1295 / ipamorelin (10mg)": 109,
  "ipamorelin (5mg)": 54,
  "ipamorelin (10mg)": 79,
  "tesamorelin (5mg)": 96,
  "tesamorelin (10mg)": 171,
  "tesamorelin (15mg)": 246,
  "tesamorelin (20mg)": 334,
  "sermorelin (5mg)": 74,
  "sermorelin (10mg)": 134,
  "ghrp-2 (5mg)": 39,
  "ghrp-2 (10mg)": 54,
  "ghrp-6 (5mg)": 39,
  "ghrp-6 (10mg)": 54,
  "mots-c (5mg)": 54,
  "mots-c (10mg)": 66,
  "mots-c (20mg)": 146,
  "mots-c (40mg)": 196,
  "igf-1 lr3 (0.1mg)": 54,
  "igf-1 lr3 (1mg)": 204,
  "bpc-157 (5mg)": 51,
  "bpc-157 (10mg)": 69,
  "bpc-157 (20mg)": 109,
  "tb-500 (5mg)": 84,
  "tb-500 (10mg)": 149,
  "bpc-157 / tb-500 blend (10mg)": 109,
  "bpc-157 / tb-500 blend (20mg)": 184,
  "kpv (10mg)": 69,
  "kpv (30mg)": 129,
  "ll-37 (5mg)": 109,
  "ara-290 (10mg)": 79,
  "thymosin alpha-1 (5mg)": 84,
  "thymosin alpha-1 (10mg)": 154,
  "thymalin (10mg)": 66,
  "klow (80mg)": 221,
  "glow (70mg)": 189,
  "ghk-cu (50mg)": 41,
  "ghk-cu (100mg)": 46,
  "ahk-cu (50mg)": 74,
  "ahk-cu (100mg)": 109,
  "melanotan i (10mg)": 59,
  "melanotan ii (10mg)": 59,
  "snap-8 (10mg)": 49,
  "snap-8 (20mg)": 79,
  "pt-141 (10mg)": 61,
  "kisspeptin-10 (5mg)": 59,
  "kisspeptin-10 (10mg)": 84,
  "oxytocin acetate (5mg)": 74,
  "oxytocin acetate (10mg)": 96,
  "hcg (5000iu)": 91,
  "hcg (10000iu)": 171,
  "vip (10mg)": 143,
  "semax (5mg)": 46,
  "semax (10mg)": 59,
  "semax (30mg)": 159,
  "selank (5mg)": 46,
  "selank (10mg)": 59,
  "epithalon (10mg)": 59,
  "epithalon (50mg)": 159,
  "ss-31 (10mg)": 91,
  "ss-31 (50mg)": 284,
  "5-amino-1mq (5mg)": 49,
  "5-amino-1mq (10mg)": 74,
  "5-amino-1mq (50mg)": 109,
  "nad+ (500mg)": 69,
  "nad+ (1000mg)": 109,
  "humanin (10mg)": 309,
  "foxo4-dri (10mg)": 384,
  "dsip (5mg)": 46,
  "dsip (10mg)": 84,
};

function resolveChineseKitCost(norm: string): number {
  if (SUPPLY_KIT_COST[norm] !== undefined) return SUPPLY_KIT_COST[norm];
  // Retatrutide US-warehouse (Quick Ship) keeps its own cost path below.
  let kitCost = 0;
  if (norm.includes('bacteriostatic water') || norm.includes('bac water')) {
    if (norm.includes('10ml')) kitCost = 15;
    else kitCost = 10;
  } else if (norm.includes('bpc-157') && norm.includes('tb-500') && norm.includes('blend')) {
    if (norm.includes('20mg')) kitCost = 165;
    else kitCost = 100;
  } else if (norm.includes('bpc-157')) {
    // China/XTP-Bella sells: 10mg only
    if (norm.includes('10mg')) kitCost = 70;
  } else if (norm.includes('tb-500')) {
    // China/XTP-Bella sells: 5mg only
    if (norm.includes('5mg')) kitCost = 69;
  } else if (norm.includes('retatrutide')) {
    // China/XTP-Bella sells: 10, 15, 20, 30, 60mg (also 10, 20, 30mg via US warehouse)
    const usCost = resolveChineseUsWarehouseCost(norm);
    if (usCost) return usCost;
    if (norm.includes('60mg')) kitCost = 325;
    else if (norm.includes('30mg')) kitCost = 230;
    else if (norm.includes('20mg')) kitCost = 200;
    else if (norm.includes('15mg')) kitCost = 155;
    else if (norm.includes('10mg')) kitCost = 110;
    // 5mg, 50mg, 100mg not sold by China — kitCost stays 0
  } else if (norm.includes('tirzepatide')) {
    // China/XTP-Bella sells: 10, 15, 20, 30, 60mg
    if (norm.includes('60mg')) kitCost = 195;
    else if (norm.includes('30mg')) kitCost = 135;
    else if (norm.includes('20mg')) kitCost = 110;
    else if (norm.includes('15mg')) kitCost = 95;
    else if (norm.includes('10mg')) kitCost = 75;
    // 40mg, 50mg, 70mg, 120mg not sold by China — kitCost stays 0
  } else if (norm.includes('cjc-1295') && norm.includes('ipamorelin')) {
    // China/XTP-Bella sells: 10mg and 20mg
    if (norm.includes('20mg')) kitCost = 200;
    else if (norm.includes('10mg')) kitCost = 100;
  } else if (norm.includes('cjc-1295')) {
    // China/XTP-Bella sells: 10mg only
    if (norm.includes('10mg')) kitCost = 149;
  } else if (norm.includes('ipamorelin')) {
    // China/XTP-Bella sells: 10mg only
    if (norm.includes('10mg')) kitCost = 80;
  } else if (norm.includes('tesamorelin')) {
    // China/XTP-Bella sells: 5mg only
    if (norm.includes('5mg')) kitCost = 99;
  } else if (norm.includes('ghk-cu') || norm.includes('copper peptide')) {
    // China/XTP-Bella sells: 50mg and 100mg only
    if (norm.includes('100mg')) kitCost = 60;
    else if (norm.includes('50mg')) kitCost = 39;
  } else if (norm.includes('mots-c')) {
    // China/XTP-Bella sells: 5mg and 10mg
    if (norm.includes('10mg')) kitCost = 70;
    else if (norm.includes('5mg')) kitCost = 59;
    // 40mg not sold by China — kitCost stays 0
  } else if (norm.includes('ss-31') || norm.includes('elamipretide')) {
    // China/XTP-Bella sells: 10mg only
    if (norm.includes('10mg')) kitCost = 90;
  } else if (norm.includes('semax') && norm.includes('selank')) {
    kitCost = 115;
  } else if (norm.includes('semax')) {
    if (norm.includes('10mg')) kitCost = 75;
    else kitCost = 55;
  } else if (norm.includes('selank')) {
    kitCost = 75;
  } else if (norm.includes('epitalon')) {
    // China/XTP-Bella sells: 10mg only
    if (norm.includes('10mg')) kitCost = 65;
  } else if (norm.includes('snap-8')) {
    kitCost = 60;
  } else if (norm.includes('glow')) {
    kitCost = 135;
  } else if (norm.includes('nad+') || norm.includes('nicotinamide adenine')) {
    if (norm.includes('1000mg')) kitCost = 140;
    else kitCost = 75;
  } else if (norm.includes('glutathione')) {
    // China/XTP-Bella sells: 600mg only
    if (norm.includes('600mg')) kitCost = 80;
  } else if (norm.includes('5-amino') || norm.includes('1mq')) {
    // China/XTP-Bella sells: 50mg only
    if (norm.includes('50mg')) kitCost = 125;
  }
  return kitCost;
}

function dedupeNames(extraNames: string[]): string[] {
  const all = new Set<string>(SAMPLE_INVENTORY.map(p => p.name));
  for (const n of extraNames) {
    if (typeof n === 'string' && n.length > 0 && n.length <= 200) all.add(n);
  }
  return [...all];
}

export interface ProductPrices {
  norKit?: number;
  norVial?: number;
  chnKit?: number;
  chnVial?: number;
}

// Final member-facing sell prices: markups + admin overrides applied here so
// the client never sees costs or markup percentages.
export function computePriceBook(
  extraNames: string[],
  markups: PricingMarkups,
  overrides: Record<string, PriceOverride>,
): Record<string, ProductPrices> {
  const book: Record<string, ProductPrices> = {};
  for (const name of dedupeNames(extraNames)) {
    const norm = name.toLowerCase();
    const o = overrides[name] || {};
    const entry: ProductPrices = {};

    const norW = resolveKitCost(norm);
    const norKit = o.norKit ?? (norW ? Math.round(norW * (1 + markups.norKitPct / 100)) : 0);
    if (norKit) entry.norKit = norKit;

    if (o.norVial !== undefined) entry.norVial = o.norVial;
    else if (typeof markups.norVialPct === 'number' && norW) {
      entry.norVial = Math.round((norW / 10) * (1 + markups.norVialPct / 100));
    }

    const usW = resolveChineseUsWarehouseCost(norm);
    const chnW = usW || resolveChineseKitCost(norm);
    const chnKit = o.chnKit ?? (chnW ? Math.round(chnW * (1 + markups.chnKitPct / 100)) : 0);
    if (chnKit) entry.chnKit = chnKit;

    const chnVial = o.chnVial ?? (usW
      ? Math.round((usW / 10) * (1 + markups.chnVialUSPct / 100))
      : chnW ? Math.round((chnW / 10) * (1 + markups.chnVialDirPct / 100)) : 0);
    if (chnVial) entry.chnVial = chnVial;

    if (Object.keys(entry).length) book[name] = entry;
  }
  return book;
}

export interface WholesaleCosts {
  norW: number;
  usW: number;
  chnW: number;
}

// Raw wholesale costs — admin eyes only.
export function computeWholesaleBook(extraNames: string[]): Record<string, WholesaleCosts> {
  const book: Record<string, WholesaleCosts> = {};
  for (const name of dedupeNames(extraNames)) {
    const norm = name.toLowerCase();
    const norW = resolveKitCost(norm);
    const usW = resolveChineseUsWarehouseCost(norm);
    const chnW = usW || resolveChineseKitCost(norm);
    if (norW || usW || chnW) book[name] = { norW, usW, chnW };
  }
  return book;
}
