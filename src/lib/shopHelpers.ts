import { ShopProduct, CartItem, ShippingOption } from './shopTypes';
import { SAMPLE_INVENTORY } from '../data/shopInventory';
import type { PricingConfig } from './pricingConfig';

export function getProductBaseAndSize(name: string) {
  const match = name.match(/^(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return { baseName: match[1].trim(), size: match[2].trim() };
  }
  return { baseName: name, size: '' };
}

export function findShopProductMatch(compoundName: string, vialSizeMg?: number): ShopProduct | null {
  if (!compoundName || !compoundName.trim()) return null;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = normalize(compoundName);
  if (!target) return null;

  const candidates = SAMPLE_INVENTORY.filter((p) => {
    const { baseName } = getProductBaseAndSize(p.name);
    const base = normalize(baseName);
    if (!base) return false;
    return base === target || base.includes(target) || target.includes(base);
  });
  if (candidates.length === 0) return null;

  if (vialSizeMg && vialSizeMg > 0) {
    let best: ShopProduct | null = null;
    let bestDiff = Infinity;
    for (const p of candidates) {
      const { size } = getProductBaseAndSize(p.name);
      const mg = parseFloat((size || '').replace(/[^0-9.]/g, ''));
      if (!isFinite(mg)) continue;
      const diff = Math.abs(mg - vialSizeMg);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = p;
      }
    }
    if (best) return best;
  }

  return candidates[0];
}

export function getSecondaryBenefit(baseName: string, category: string): string {
  const normName = baseName.toLowerCase();

  if (normName.includes('pt141') || normName.includes('pt-141') || normName.includes('bremelanotide')) return 'Sexual Health';
  if (normName.includes('cjc') && normName.includes('ipam')) return 'Anti-Aging & Sleep';
  if (normName.includes('cjc')) return 'Sleep Quality';
  if (normName.includes('ipamorelin')) return 'Deep Sleep';
  if (normName.includes('tesamorelin')) return 'Adipose Reduction';
  if (normName.includes('mots-c') || normName.includes('mots')) return 'Metabolic Health';
  if (normName.includes('retatrutide')) return 'Triple GLP/GIP/GCG';
  if (normName.includes('tirzepatide')) return 'Dual GLP/GIP';
  if (normName.includes('semaglutide')) return 'Appetite Control';
  if (normName.includes('cagrilintide')) return 'Satiety Synergy';
  if (normName.includes('aod-9604') || normName.includes('aod')) return 'Targeted Fat Loss';
  if (normName.includes('bpc-157') && normName.includes('tb-500')) return 'Rapid Repair Blend';
  if (normName.includes('bpc')) return 'Gut & Tissue Healing';
  if (normName.includes('tb-500') || normName.includes('tb500') || normName.includes('thymosin beta')) return 'Cellular Migration';
  if (normName.includes('ghk-cu') || normName.includes('ghk cu') || normName.includes('copper')) return 'Collagen Synthesis';
  if (normName.includes('klow')) return 'Dermal Repair';
  if (normName.includes('melanotan') || normName.includes('mt2') || normName.includes('mt-2')) return 'Skin Pigmentation';
  if (normName.includes('nad')) return 'Cellular Energy';
  if (normName.includes('semax') && normName.includes('selank')) return 'Cognitive Synergy';
  if (normName.includes('semax')) return 'Mental Clarity';
  if (normName.includes('selank')) return 'Anxiety Relief';
  if (normName.includes('epitalon')) return 'Telomere Support';
  if (normName.includes('ss-31') || normName.includes('ss31')) return 'Mitochondrial Health';
  if (normName.includes('ta1') || normName.includes('thymosin alpha')) return 'Immune Defense';
  if (normName.includes('kpv')) return 'Anti-Inflammatory';
  if (normName.includes('dsip')) return 'Sleep Architecture';
  if (normName.includes('bacteriostatic') || normName.includes('solvent') || normName.includes('water')) return 'Peptide Solvent';

  if (category === 'Muscle Growth') return 'Hormone Support';
  if (category === 'Weight Loss') return 'Metabolic Support';
  if (category === 'Healing & Repair') return 'Tissue Recovery';
  if (category === 'Beauty & Radiance') return 'Anti-Aging';
  if (category === 'Cognitive & Focus') return 'Neuroprotection';
  if (category === 'Longevity & Cellular') return 'ATP Production';
  if (category === 'Immune & Health') return 'Cell Defense';
  if (category === 'Sleep & Recovery') return 'Stress Recovery';

  return 'Research Grade';
}

export function getSecondaryBenefitStyle(benefit: string): string {
  const normBenefit = benefit.toLowerCase();

  if (normBenefit.includes('sexual')) return 'bg-rose-500/10 text-rose-300 border border-rose-500/20';
  if (normBenefit.includes('sleep') || normBenefit.includes('stress')) return 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20';
  if (
    normBenefit.includes('adipose') || normBenefit.includes('metabolic') || normBenefit.includes('glp') ||
    normBenefit.includes('appetite') || normBenefit.includes('satiety') || normBenefit.includes('fat loss')
  ) return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
  if (
    normBenefit.includes('repair') || normBenefit.includes('healing') ||
    normBenefit.includes('tissue') || normBenefit.includes('inflammatory')
  ) return 'bg-orange-500/10 text-orange-300 border border-orange-500/20';
  if (
    normBenefit.includes('migration') || normBenefit.includes('collagen') || normBenefit.includes('dermal') ||
    normBenefit.includes('pigmentation') || normBenefit.includes('anti-aging')
  ) return 'bg-[#2dd4bf]/10 text-[#5eead4] border border-[#2dd4bf]/20';
  if (
    normBenefit.includes('energy') || normBenefit.includes('atp') ||
    normBenefit.includes('telomere') || normBenefit.includes('mitochondrial')
  ) return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
  if (
    normBenefit.includes('cognitive') || normBenefit.includes('mental') ||
    normBenefit.includes('anxiety') || normBenefit.includes('neuroprotection')
  ) return 'bg-sky-500/10 text-sky-300 border border-sky-500/20';
  if (normBenefit.includes('immune') || normBenefit.includes('defense')) return 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20';
  if (normBenefit.includes('solvent')) return 'bg-slate-500/10 text-slate-300 border border-slate-500/20';

  return 'bg-[#27272a]/40 text-slate-200 border border-[#3f3f46]';
}

export function parseShippingAddress(addressStr: string) {
  const result = { addressLine1: '', city: '', state: '', zipCode: '' };
  if (!addressStr) return result;

  let bestZip = '';
  let maxScore = -999;
  const zipMatches = [...addressStr.matchAll(/\b\d{5}(-\d{4})?\b/g)];

  for (const match of zipMatches) {
    const digits = match[0];
    const index = match.index ?? 0;
    let score = 0;

    if (digits.startsWith('3')) score += 10;
    if (index > addressStr.length / 2) score += 5;
    if (index === 0 || addressStr.slice(0, index).trim() === '') score -= 20;

    const textAfter = addressStr.slice(index + digits.length).toLowerCase();
    const immediateAfter = textAfter.slice(0, 50);
    if (/\b(ave|avenue|st|street|rd|road|dr|drive|way|court|ct|lane|ln|blvd|boulevard)\b/.test(immediateAfter)) score -= 15;

    if (score > maxScore) {
      maxScore = score;
      bestZip = digits;
    }
  }

  if (bestZip) {
    result.zipCode = bestZip;
    const zipIdx = addressStr.indexOf(bestZip);
    if (zipIdx !== -1) {
      addressStr = addressStr.slice(0, zipIdx) + addressStr.slice(zipIdx + bestZip.length);
    }
  }

  addressStr = addressStr.replace(/,\s*,/g, ',');
  addressStr = addressStr.replace(/,+/g, ',').replace(/\s+/g, ' ').trim();
  addressStr = addressStr.replace(/^[, ]+|[, ]+$/g, '').trim();

  const stateKeywords = [
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware',
    'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky',
    'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi',
    'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey', 'new mexico',
    'new york', 'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania',
    'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas', 'utah', 'vermont',
    'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming',
    'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 'ks',
    'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny',
    'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'
  ];

  const streetSuffixRegex = /\b(ave|avenue|st|street|rd|road|dr|drive|way|court|ct|lane|ln|blvd|boulevard|loop|pl|place|ter|terrace|highway|hwy|pkwy|parkway)\b/i;
  const toTitleCase = (str: string) => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  const parts = addressStr.split(',').map(p => p.trim()).filter(Boolean);
  let foundState = '';
  let foundCity = '';
  let foundAddress = '';

  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1];
    const lastPartWords = lastPart.split(/\s+/).filter(Boolean);

    if (lastPartWords.length > 0) {
      const lastWord = lastPartWords[lastPartWords.length - 1];
      const lastWordLower = lastWord.toLowerCase();

      if (stateKeywords.includes(lastWordLower)) {
        foundState = lastWord;
        if (lastPartWords.length > 1) {
          foundCity = lastPartWords.slice(0, -1).join(' ');
          foundAddress = parts.slice(0, -1).join(', ');
        } else {
          if (parts.length >= 2) {
            foundCity = parts[parts.length - 2];
            foundAddress = parts.slice(0, -2).join(', ');
          }
        }
      } else {
        const lastPartLower = lastPart.toLowerCase();
        if (stateKeywords.includes(lastPartLower)) {
          foundState = lastPart;
          if (parts.length >= 2) {
            foundCity = parts[parts.length - 2];
            foundAddress = parts.slice(0, -2).join(', ');
          }
        } else {
          let stateIdx = -1;
          for (let i = 0; i < lastPartWords.length; i++) {
            if (stateKeywords.includes(lastPartWords[i].toLowerCase())) {
              stateIdx = i;
              break;
            }
          }

          if (stateIdx !== -1) {
            foundState = lastPartWords[stateIdx];
            foundCity = lastPartWords.slice(0, stateIdx).join(' ');
            const extraStreet = lastPartWords.slice(stateIdx + 1).join(' ');
            foundAddress = parts.slice(0, -1).join(', ');
            if (extraStreet) foundAddress = foundAddress ? `${foundAddress}, ${extraStreet}` : extraStreet;
          } else {
            if (parts.length >= 3) {
              foundState = parts[parts.length - 1];
              foundCity = parts[parts.length - 2];
              foundAddress = parts.slice(0, -2).join(', ');
            } else if (parts.length === 2) {
              foundCity = parts[parts.length - 1];
              foundAddress = parts[0];
            } else {
              foundAddress = parts[0];
            }
          }
        }
      }
    }
  }

  if (foundCity) {
    const streetMatch = foundCity.match(streetSuffixRegex);
    if (streetMatch) {
      const matchIdx = foundCity.indexOf(streetMatch[0]);
      if (matchIdx !== -1) {
        const streetPart = foundCity.slice(0, matchIdx + streetMatch[0].length).trim();
        const cityPart = foundCity.slice(matchIdx + streetMatch[0].length).trim();
        if (cityPart) {
          foundAddress = foundAddress ? `${foundAddress}, ${streetPart}` : streetPart;
          foundCity = cityPart;
        }
      }
    }
  }

  result.addressLine1 = foundAddress || parts[0] || '';
  result.city = foundCity ? toTitleCase(foundCity) : '';
  result.state = foundState ? (foundState.length === 2 ? foundState.toUpperCase() : toTitleCase(foundState)) : '';

  if (result.zipCode && (!result.city || !result.state)) {
    const zip = result.zipCode;
    if (zip === '34609' || zip === '34608' || zip === '34606' || zip === '34607' || zip === '34610' || zip === '34611' || zip.startsWith('3460') || zip.startsWith('3461')) {
      if (!result.city) result.city = 'Spring Hill';
      if (!result.state) result.state = 'FL';
    } else if (zip.startsWith('346')) {
      if (!result.city) result.city = 'Spring Hill';
      if (!result.state) result.state = 'FL';
    } else if (zip.startsWith('336')) {
      if (!result.city) result.city = 'Tampa';
      if (!result.state) result.state = 'FL';
    } else if (zip.startsWith('335')) {
      if (!result.city) result.city = 'Brandon';
      if (!result.state) result.state = 'FL';
    } else if (zip.startsWith('32') || zip.startsWith('33') || zip.startsWith('34')) {
      if (!result.state) result.state = 'FL';
    }
  }

  result.addressLine1 = result.addressLine1.trim();
  result.city = result.city.trim();
  result.state = result.state.trim();
  result.zipCode = result.zipCode.trim();
  if (result.state.length === 2) result.state = result.state.toUpperCase();

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sell prices come from the server-computed price book (config.priceBook),
// fetched via /api/prices. Wholesale costs live server-side only
// (server/pricingData.ts) so they never ship in the client bundle.
// Admin overrides in config take precedence for instant feedback while editing.
// ─────────────────────────────────────────────────────────────────────────────

// Kit sell price (Norway source)
export function getKitSellPrice(name: string, config?: PricingConfig): number {
  if (config?.overrides?.[name]?.norKit !== undefined) return config.overrides[name].norKit!;
  return config?.priceBook?.[name]?.norKit ?? 0;
}

// China kit sell price
export function getChinaKitSellPrice(name: string, config?: PricingConfig): number {
  if (config?.overrides?.[name]?.chnKit !== undefined) return config.overrides[name].chnKit!;
  return config?.priceBook?.[name]?.chnKit ?? 0;
}

// China vial sell price
export function getChinaVialSellPrice(name: string, config?: PricingConfig): number {
  if (config?.overrides?.[name]?.chnVial !== undefined) return config.overrides[name].chnVial!;
  return config?.priceBook?.[name]?.chnVial ?? 0;
}

export function hasUsWarehouseShipping(name: string): boolean {
  const norm = name.toLowerCase();
  return norm.includes('us warehouse') && norm.includes('retatrutide');
}

// ─── Flat-rate shipping rules (single source of truth for server + client) ──
export const NORWAY_KIT_FLAT_SHIPPING = 30;
export const CHINA_FLAT_SHIPPING = 25;

export function isUsWarehouseProductName(name: string): boolean {
  return name.toLowerCase().includes('us warehouse');
}

function isBacWaterProductName(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes('bac water') || n.includes('bacteriostatic');
}

// China orders: $25 flat, free only when every non-BAC-water item ships from
// the US warehouse. BAC water never affects the rate; an order of only BAC
// water still ships from China and pays the flat rate.
export function getChinaFlatShipping(items: { name: string }[]): number {
  const shippable = items.filter(i => !isBacWaterProductName(i.name));
  const allUsWarehouse = shippable.length > 0 && shippable.every(i => isUsWarehouseProductName(i.name));
  return allUsWarehouse ? 0 : CHINA_FLAT_SHIPPING;
}

// Category accent hues — makes the catalog scannable by product type
const CATEGORY_BADGE_STYLES: Record<string, string> = {
  'Muscle Growth':          'bg-rose-500/10 text-rose-300 border-rose-500/25',
  'Weight Loss':            'bg-amber-500/10 text-amber-300 border-amber-500/25',
  'Healing & Repair':       'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  'Beauty & Radiance':      'bg-teal-500/10 text-teal-300 border-teal-500/25',
  'Cognitive & Focus':      'bg-sky-500/10 text-sky-300 border-sky-500/25',
  'Longevity & Cellular':   'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
  'Immune & Health':        'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/25',
  'Sleep & Recovery':       'bg-violet-500/10 text-violet-300 border-violet-500/25',
  'Sexual Health':          'bg-pink-500/10 text-pink-300 border-pink-500/25',
  'Reconstitution Solvents':'bg-slate-500/10 text-slate-300 border-slate-600/40',
};

export function getCategoryBadgeStyle(category: string): string {
  return CATEGORY_BADGE_STYLES[category] || 'bg-[#1e293b] text-slate-300 border-slate-700/50';
}

// Strip country-of-origin wording from a product's DISPLAY name. The raw
// `name` is a pricing key, so never mutate it — only what the user sees.
export function cleanProductName(name: string): string {
  if (!name) return '';
  return name
    .replace(/\s*\b(china|norway)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\(/g, ' (')
    .replace(/\(\s+/g, '(')
    .trim();
}

export function getCleanDescription(desc: string): string {
  if (!desc) return '';
  let clean = desc
    .replace(/Supplied in a professional 10 vials\/kit box\./gi, 'Supplied as 1 individual high-purity 3ml research vial (price is per single vial).')
    .replace(/Supplied as an exclusive beauty and skin radiance regulatory peptide engineered in premium 80mg kits/gi, 'Supplied as 1 individual high-purity 3ml research vial (price is per single vial).')
    // Remove country-of-origin sourcing wording.
    .replace(/\s*Sourced from certified (china|norway)[^.]*\./gi, '')
    .replace(/\s*Ships internationally from (china|norway)[^.]*\./gi, ' Ships internationally.')
    .replace(/\b(china|norway)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\./g, '.')
    .trim();

  if (!clean.includes('vial') && !clean.includes('Vial') && !clean.includes('Reconstitution Solvent')) {
    clean += ' Supplied as 1 individual high-purity 3ml research vial.';
  }
  return clean;
}

export const getEstimatedDeliveryDate = (minDays: number, maxDays: number) => {
  const getFormattedDate = (days: number) => {
    const d = new Date();
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) added++;
    }
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (minDays === maxDays) return getFormattedDate(minDays);
  return `${getFormattedDate(minDays)} – ${getFormattedDate(maxDays)}`;
};

export function getSalePrice(price: number, name?: string, config?: PricingConfig): number {
  if (name && config?.overrides?.[name]?.norVial !== undefined) return config.overrides[name].norVial!;
  if (name && config?.priceBook?.[name]?.norVial !== undefined) return config.priceBook[name].norVial!;
  return price;
}

export const getShippingOptions = (zip: string, totalVials: number, cart: CartItem[] = []): { options: ShippingOption[]; zoneName: string; weightLbs: number; isFreeShipping: boolean; nonBacVialsCount: number; nonBacSubtotal: number } => {
  const zipClean = zip.replace(/\s+/g, '').slice(0, 5);
  const firstDigit = parseInt(zipClean[0]) || 0;

  let zoneDistanceFee = 0;
  let zoneName = "Local Region (Florida Hub)";

  if (zipClean.length >= 3) {
    if (zipClean.startsWith('32') || zipClean.startsWith('33') || zipClean.startsWith('34')) {
      zoneDistanceFee = 0;
      zoneName = "Zone 1: Florida (Local Hub)";
    } else if (
      zipClean.startsWith('30') || zipClean.startsWith('31') ||
      zipClean.startsWith('29') || zipClean.startsWith('35') ||
      zipClean.startsWith('36') || zipClean.startsWith('37') ||
      zipClean.startsWith('38') || zipClean.startsWith('39') ||
      zipClean.startsWith('27') || zipClean.startsWith('28')
    ) {
      zoneDistanceFee = 1.95;
      zoneName = "Zone 2: Southeast Regional";
    } else if (firstDigit === 0 || firstDigit === 1 || firstDigit === 2) {
      zoneDistanceFee = 3.90;
      zoneName = "Zone 3: East Coast & Eastern US";
    } else if (firstDigit === 5 || firstDigit === 6 || firstDigit === 7) {
      zoneDistanceFee = 5.85;
      zoneName = "Zone 4: Mid-West & Plains";
    } else if (firstDigit === 8 || firstDigit === 9) {
      zoneDistanceFee = 8.50;
      zoneName = "Zone 5: Mountains & Pacific West";
    } else {
      zoneDistanceFee = 4.50;
      zoneName = "Zone 3: Central US Transit";
    }
  } else {
    zoneName = "Florida Origin (Pending Destination ZIP)";
  }

  const totalWeightOz = 4 + (totalVials * 1.5);
  const weightLbs = Math.round((totalWeightOz / 16) * 10) / 10;

  const nonBacItems = cart.filter(item => item.product.id !== 'prod_bac_water_10ml');
  const nonBacVialsCount = nonBacItems.reduce((sum, item) => sum + item.quantity, 0);
  const nonBacSubtotal = nonBacItems.reduce((sum, item) => sum + (getSalePrice(item.product.price) * item.quantity), 0);
  const isFreeShipping = nonBacSubtotal >= 100;

  const options: ShippingOption[] = [
    {
      id: 'usps_ground',
      carrier: 'USPS',
      name: 'USPS Ground Advantage™',
      cost: isFreeShipping ? 0 : (4.25 + (totalVials > 1 ? (totalVials - 1) * 0.35 : 0) + (zoneDistanceFee * 0.5)),
      transitDaysMin: 3,
      transitDaysMax: 5,
      estimatedDeliveryDate: getEstimatedDeliveryDate(3, 5)
    },
    {
      id: 'usps_priority',
      carrier: 'USPS',
      name: 'USPS Priority Mail®',
      cost: 8.45 + (totalVials > 1 ? (totalVials - 1) * 0.65 : 0) + (zoneDistanceFee * 0.75),
      transitDaysMin: 2,
      transitDaysMax: 3,
      estimatedDeliveryDate: getEstimatedDeliveryDate(2, 3)
    },
    {
      id: 'usps_express',
      carrier: 'USPS',
      name: 'USPS Priority Mail Express®',
      cost: 25.90 + (totalVials > 1 ? (totalVials - 1) * 1.15 : 0) + (zoneDistanceFee * 1.1),
      transitDaysMin: 1,
      transitDaysMax: 2,
      estimatedDeliveryDate: getEstimatedDeliveryDate(1, 2)
    },
    {
      id: 'ups_ground',
      carrier: 'UPS',
      name: 'UPS® Ground',
      cost: 9.50 + (totalVials > 1 ? (totalVials - 1) * 0.50 : 0) + (zoneDistanceFee * 0.8),
      transitDaysMin: 3,
      transitDaysMax: 4,
      estimatedDeliveryDate: getEstimatedDeliveryDate(3, 4)
    },
    {
      id: 'ups_3day',
      carrier: 'UPS',
      name: 'UPS 3 Day Select®',
      cost: 15.80 + (totalVials > 1 ? (totalVials - 1) * 0.85 : 0) + (zoneDistanceFee * 1.05),
      transitDaysMin: 3,
      transitDaysMax: 3,
      estimatedDeliveryDate: getEstimatedDeliveryDate(3, 3)
    },
    {
      id: 'ups_2day',
      carrier: 'UPS',
      name: 'UPS 2nd Day Air®',
      cost: 23.90 + (totalVials > 1 ? (totalVials - 1) * 1.40 : 0) + (zoneDistanceFee * 1.3),
      transitDaysMin: 2,
      transitDaysMax: 2,
      estimatedDeliveryDate: getEstimatedDeliveryDate(2, 2)
    },
    {
      id: 'ups_nextday',
      carrier: 'UPS',
      name: 'UPS Next Day Air®',
      cost: 46.50 + (totalVials > 1 ? (totalVials - 1) * 2.10 : 0) + (zoneDistanceFee * 1.8),
      transitDaysMin: 1,
      transitDaysMax: 1,
      estimatedDeliveryDate: getEstimatedDeliveryDate(1, 1)
    }
  ];

  return {
    options: options.map(opt => ({ ...opt, cost: Math.round(opt.cost * 100) / 100 })),
    zoneName,
    weightLbs,
    isFreeShipping,
    nonBacVialsCount,
    nonBacSubtotal
  };
};
