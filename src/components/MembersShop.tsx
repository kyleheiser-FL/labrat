import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  CheckCircle, 
  X,
  XCircle, 
  Clock, 
  Plus, 
  Minus,
  Trash2, 
  Edit, 
  ClipboardList, 
  Mail, 
  UserCheck, 
  MapPin, 
  Phone, 
  User, 
  DollarSign, 
  AlertTriangle, 
  Loader2, 
  PlusCircle, 
  Package, 
  ShieldAlert, 
  BadgeCheck,
  Send,
  ArrowLeft,
  Search,
  Truck,
  Sparkles,
  Flame,
  Brain,
  Shield,
  Heart,
  Activity,
  Droplet,
  Moon,
  Dna,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { triggerHaptic } from '../lib/haptics';
import { safeLocalStorage } from '../lib/storage';
import { handleFirestoreError, OperationType } from '../lib/db';

// Interfaces for our Members Shop
export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  inventory: number;
  imageUrl?: string;
}

export interface MemberProfile {
  id: string;
  email: string;
  displayName: string;
  status: 'pending' | 'approved' | 'blocked';
  shippingAddress: string;
  phone: string;
  createdAt: any;
  updatedAt: any;
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
}

export interface OrderDetail {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  shippingInfo: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    notes?: string;
    carrier?: string;
    method?: string;
    cost?: number;
    deliveryEstimate?: string;
    weightLbs?: number;
  };
  status: 'placed' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentStatus?: 'unpaid' | 'paid';
  trackingNumber?: string;
  trackingStatus?: 'shipped' | 'delivered';
  tax?: number;
  createdAt: any;
}

type LabratThemeMode = 'neon' | 'clinical';

function resolveLabratTheme(): LabratThemeMode {
  if (typeof document === 'undefined') return 'neon';
  return document.documentElement.getAttribute('data-labrat-theme') === 'clinical' ? 'clinical' : 'neon';
}

// Product Vial Visual Component using photo-real branded vial assets for both Neon and Clinical themes
function ProductVialVisual({ name, category, theme = 'neon' }: { name: string; category: string; theme?: LabratThemeMode }) {
  const lowerCat = category.toLowerCase();
  const lowerName = name.toLowerCase();
  const isSolvent = lowerCat.includes('reconstitution') || lowerCat.includes('solvent') || lowerName.includes('water') || lowerName.includes('bacteriostatic');

  const cleanFullName = name.replace(/\(.*?\)/g, '').trim();
  const nameParts = cleanFullName.split(' ');
  const firstWord = nameParts[0] || 'Peptide';
  const remainingWords = nameParts.slice(1).join(' ');
  const sizeMatch = name.match(/(\d+\s*m?g|\d+\s*m?l)/i);
  const sizeValue = sizeMatch ? sizeMatch[1].trim() : (isSolvent ? '30 ml' : '10 mg');
  const neonImageSrc = isSolvent ? '/shop/labrat-real-vial-solvent.png' : '/shop/labrat-real-vial-peptide.png';
  const professionalImageSrc = isSolvent ? '/shop/labrat-professional-solvent-card.png' : '/shop/labrat-professional-product-card.png';
  const glowClass = isSolvent ? 'labrat-real-vial-visual--solvent' : 'labrat-real-vial-visual--peptide';

  if (theme === 'clinical') {
    const professionalVialSrc = isSolvent ? '/shop/labrat-professional-vial-solvent.png' : '/shop/labrat-professional-vial-peptide.png';

    return (
      <div className="w-full min-h-[300px] border-b border-slate-700/40 p-4 relative overflow-hidden select-none bg-gradient-to-br from-slate-950 via-[#0b1628] to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:1.35rem_1.35rem] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(96,165,250,0.11),transparent_30%),radial-gradient(circle_at_86%_16%,rgba(148,163,184,0.08),transparent_32%)]" />

        <div className="relative z-10 mx-auto max-w-[300px] min-h-[238px] rounded-[1.35rem] overflow-hidden border border-slate-600/50 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_24px_55px_rgba(2,6,23,0.42)]">
          <img
            src={professionalVialSrc}
            alt={`${cleanFullName} professional LabRat vial presentation`}
            className="absolute inset-0 w-full h-full object-contain object-top p-2.5"
            loading="lazy"
          />

          <div className="absolute left-3 right-3 bottom-3 rounded-xl border border-slate-300/75 bg-white/88 backdrop-blur-sm shadow-[0_10px_20px_rgba(15,23,42,0.16)] px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[9px] font-black tracking-[0.24em] uppercase text-sky-700">LABRAT</div>
                <div className="mt-0.5 text-base leading-none font-black text-slate-950 tracking-tight truncate">{firstWord}</div>
                <div className="mt-0.5 text-[11px] leading-tight text-slate-600 truncate">{remainingWords || category}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">{isSolvent ? 'Solvent' : 'Peptide'}</div>
                <div className="text-xs font-black uppercase tracking-[0.16em] text-sky-700 whitespace-nowrap">{sizeValue.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className={`labrat-real-vial-visual ${glowClass} w-full min-h-[300px] border-b border-cyan-400/10 p-4 relative overflow-hidden select-none`}>
      <div className="labrat-real-vial-grid" aria-hidden="true" />
      <div className="labrat-real-vial-orb" aria-hidden="true" />


      <div className="labrat-real-vial-photo-shell">
        <div className="labrat-real-vial-photo-frame">
          <img
            src={neonImageSrc}
            alt={`${cleanFullName} LabRat branded research vial`}
            className="labrat-real-vial-photo"
            loading="lazy"
          />
          <div className="labrat-real-vial-overlay-card">
            <div className="labrat-real-vial-overlay-brand">LABRAT</div>
            <div className="labrat-real-vial-overlay-name">{firstWord}</div>
            <div className="labrat-real-vial-overlay-sub">{remainingWords || category}</div>
            <div className="labrat-real-vial-overlay-meta">
              <span>{isSolvent ? 'Sterile Diluent' : 'Research Peptide'}</span>
              <strong>{sizeValue.toUpperCase()}</strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// Helper to parse base compound name and size from a product title
function getProductBaseAndSize(name: string) {
  const match = name.match(/^(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return {
      baseName: match[1].trim(),
      size: match[2].trim()
    };
  }
  return {
    baseName: name,
    size: ''
  };
}

// Match a cycle compound to a stocked shop product by base name (+ closest size).
// Returns the best matching product, or null if nothing is stocked for it.
// Used by the Cycle planner to show a "Reorder" link when a peptide runs low.
export function findShopProductMatch(compoundName: string, vialSizeMg?: number): ShopProduct | null {
  if (!compoundName || !compoundName.trim()) return null;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = normalize(compoundName);
  if (!target) return null;

  // Find products whose base name matches the compound name (either direction,
  // to tolerate "CJC-1295" vs "CJC-1295 Without DAC").
  const candidates = SAMPLE_INVENTORY.filter((p) => {
    const { baseName } = getProductBaseAndSize(p.name);
    const base = normalize(baseName);
    if (!base) return false;
    return base === target || base.includes(target) || target.includes(base);
  });
  if (candidates.length === 0) return null;

  // If we know the vial size, prefer the product whose mg size is closest.
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

  // Otherwise return the first (e.g. smallest-listed) candidate.
  return candidates[0];
}

// Helper to determine a secondary positive benefit for a peptide compound
function getSecondaryBenefit(baseName: string, category: string): string {
  const normName = baseName.toLowerCase();
  
  if (normName.includes('pt141') || normName.includes('pt-141') || normName.includes('bremelanotide')) {
    return 'Sexual Health';
  }
  if (normName.includes('cjc') && normName.includes('ipam')) {
    return 'Anti-Aging & Sleep';
  }
  if (normName.includes('cjc')) {
    return 'Sleep Quality';
  }
  if (normName.includes('ipamorelin')) {
    return 'Deep Sleep';
  }
  if (normName.includes('tesamorelin')) {
    return 'Adipose Reduction';
  }
  if (normName.includes('mots-c') || normName.includes('mots')) {
    return 'Metabolic Health';
  }
  if (normName.includes('retatrutide')) {
    return 'Triple GLP/GIP/GCG';
  }
  if (normName.includes('tirzepatide')) {
    return 'Dual GLP/GIP';
  }
  if (normName.includes('semaglutide')) {
    return 'Appetite Control';
  }
  if (normName.includes('cagrilintide')) {
    return 'Satiety Synergy';
  }
  if (normName.includes('aod-9604') || normName.includes('aod')) {
    return 'Targeted Fat Loss';
  }
  if (normName.includes('bpc-157') && normName.includes('tb-500')) {
    return 'Rapid Repair Blend';
  }
  if (normName.includes('bpc')) {
    return 'Gut & Tissue Healing';
  }
  if (normName.includes('tb-500') || normName.includes('tb500') || normName.includes('thymosin beta')) {
    return 'Cellular Migration';
  }
  if (normName.includes('ghk-cu') || normName.includes('ghk cu') || normName.includes('copper')) {
    return 'Collagen Synthesis';
  }
  if (normName.includes('klow')) {
    return 'Dermal Repair';
  }
  if (normName.includes('melanotan') || normName.includes('mt2') || normName.includes('mt-2')) {
    return 'Skin Pigmentation';
  }
  if (normName.includes('nad')) {
    return 'Cellular Energy';
  }
  if (normName.includes('semax') && normName.includes('selank')) {
    return 'Cognitive Synergy';
  }
  if (normName.includes('semax')) {
    return 'Mental Clarity';
  }
  if (normName.includes('selank')) {
    return 'Anxiety Relief';
  }
  if (normName.includes('epitalon')) {
    return 'Telomere Support';
  }
  if (normName.includes('ss-31') || normName.includes('ss31')) {
    return 'Mitochondrial Health';
  }
  if (normName.includes('ta1') || normName.includes('thymosin alpha')) {
    return 'Immune Defense';
  }
  if (normName.includes('kpv')) {
    return 'Anti-Inflammatory';
  }
  if (normName.includes('dsip')) {
    return 'Sleep Architecture';
  }
  if (normName.includes('bacteriostatic') || normName.includes('solvent') || normName.includes('water')) {
    return 'Peptide Solvent';
  }

  // Fallbacks by category
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

// Helper to return style classes for different secondary benefit tags for premium design variation
function getSecondaryBenefitStyle(benefit: string): string {
  const normBenefit = benefit.toLowerCase();

  if (normBenefit.includes('sexual')) {
    return 'bg-rose-500/10 text-rose-300 border border-rose-500/20';
  }
  if (normBenefit.includes('sleep') || normBenefit.includes('stress')) {
    return 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20';
  }
  if (
    normBenefit.includes('adipose') ||
    normBenefit.includes('metabolic') ||
    normBenefit.includes('glp') ||
    normBenefit.includes('appetite') ||
    normBenefit.includes('satiety') ||
    normBenefit.includes('fat loss')
  ) {
    return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
  }
  if (
    normBenefit.includes('repair') ||
    normBenefit.includes('healing') ||
    normBenefit.includes('tissue') ||
    normBenefit.includes('inflammatory')
  ) {
    return 'bg-orange-500/10 text-orange-300 border border-orange-500/20';
  }
  if (
    normBenefit.includes('migration') ||
    normBenefit.includes('collagen') ||
    normBenefit.includes('dermal') ||
    normBenefit.includes('pigmentation') ||
    normBenefit.includes('anti-aging')
  ) {
    return 'bg-[#2dd4bf]/10 text-[#5eead4] border border-[#2dd4bf]/20';
  }
  if (
    normBenefit.includes('energy') ||
    normBenefit.includes('atp') ||
    normBenefit.includes('telomere') ||
    normBenefit.includes('mitochondrial')
  ) {
    return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
  }
  if (
    normBenefit.includes('cognitive') ||
    normBenefit.includes('mental') ||
    normBenefit.includes('anxiety') ||
    normBenefit.includes('neuroprotection')
  ) {
    return 'bg-sky-500/10 text-sky-300 border border-sky-500/20';
  }
  if (normBenefit.includes('immune') || normBenefit.includes('defense')) {
    return 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20';
  }
  if (normBenefit.includes('solvent')) {
    return 'bg-slate-500/10 text-slate-300 border border-slate-500/20';
  }

  return 'bg-[#27272a]/40 text-slate-200 border border-[#3f3f46]';
}

// Helper to intelligently split user's free-form registration address into lines, city, state, zip
function parseShippingAddress(addressStr: string) {
  const result = {
    addressLine1: '',
    city: '',
    state: '',
    zipCode: ''
  };

  if (!addressStr) return result;

  // 1. Extract ZIP code using smart scoring to avoid picking up the street number (e.g., 13367 inside "13367 twin lake Ave")
  let bestZip = '';
  let maxScore = -999;
  const zipMatches = [...addressStr.matchAll(/\b\d{5}(-\d{4})?\b/g)];
  
  for (const match of zipMatches) {
    const digits = match[0];
    const index = match.index ?? 0;
    let score = 0;
    
    // Florida prefix (3xxxx) score booster (since LabHub is Florida based)
    if (digits.startsWith('3')) {
      score += 10;
    }
    // Location: favors ZIP at the end
    if (index > addressStr.length / 2) {
      score += 5;
    }
    // Very beginning: house number penalty
    if (index === 0 || addressStr.slice(0, index).trim() === '') {
      score -= 20;
    }
    // Checks for trailing street indicators, which implies it's a house number
    const textAfter = addressStr.slice(index + digits.length).toLowerCase();
    const immediateAfter = textAfter.slice(0, 50);
    if (/\b(ave|avenue|st|street|rd|road|dr|drive|way|court|ct|lane|ln|blvd|boulevard)\b/.test(immediateAfter)) {
      score -= 15;
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestZip = digits;
    }
  }

  if (bestZip) {
    result.zipCode = bestZip;
    // Remove ONLY the first instance of bestZip
    const zipIdx = addressStr.indexOf(bestZip);
    if (zipIdx !== -1) {
      addressStr = addressStr.slice(0, zipIdx) + addressStr.slice(zipIdx + bestZip.length);
    }
  }

  // Clean double commas (including those separated by spaces like ", ,") and duplicate spaces
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

  // Helper to capitalize first letter of words
  const toTitleCase = (str: string) => {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

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
      
      // Check if last word is a state keyword
      if (stateKeywords.includes(lastWordLower)) {
        foundState = lastWord;
        if (lastPartWords.length > 1) {
          foundCity = lastPartWords.slice(0, -1).join(' ');
          foundAddress = parts.slice(0, -1).join(', ');
        } else {
          // Last part is only the state name, city must be in previous part
          if (parts.length >= 2) {
            foundCity = parts[parts.length - 2];
            foundAddress = parts.slice(0, -2).join(', ');
          }
        }
      } else {
        // Maybe the entire last part is a multi-word state name (like New York)
        const lastPartLower = lastPart.toLowerCase();
        if (stateKeywords.includes(lastPartLower)) {
          foundState = lastPart;
          if (parts.length >= 2) {
            foundCity = parts[parts.length - 2];
            foundAddress = parts.slice(0, -2).join(', ');
          }
        } else {
          // Let's search inside the last part if any word is a state keyword
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
            if (extraStreet) {
              foundAddress = foundAddress ? `${foundAddress}, ${extraStreet}` : extraStreet;
            }
          } else {
            // Standard layout fallback: Street, City, State
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

  // Super-smart layout splitting block: if foundCity contains a street suffix, we split it there!
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

  // Smart ZIP code fallback mapping for city/state if they could not be parsed from standard string layout
  if (result.zipCode && (!result.city || !result.state)) {
    const zip = result.zipCode;
    // Spring Hill & surrounding Tampa Bay, FL ZIP codes
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

  // Final trim and safety clean up
  result.addressLine1 = result.addressLine1.trim();
  result.city = result.city.trim();
  result.state = result.state.trim();
  result.zipCode = result.zipCode.trim();

  // If there's any state abbreviation match, uppercase it for visual polish
  if (result.state.length === 2) {
    result.state = result.state.toUpperCase();
  }

  return result;
}

// Dynamic KaosLabs 10-vial kit cost calculation to estimate cost per individual vial (plus shipping allocation)
export function getProductCostPerVial(name: string, basePrice: number): number {
  const norm = name.toLowerCase();
  
  // Specific KaosLabs 10-vial kit cost approximations
  let kitCost = 0;
  if (norm.includes('bacteriostatic water') || norm.includes('bac water')) {
    kitCost = 20; // 2 dollars per vial
  } else if (norm.includes('bpc-157') && norm.includes('tb-500') && norm.includes('blend')) {
    kitCost = 140; 
  } else if (norm.includes('bpc-157')) {
    if (norm.includes('20mg')) kitCost = 150;
    else if (norm.includes('10mg')) kitCost = 90;
    else kitCost = 55;
  } else if (norm.includes('tb-500')) {
    if (norm.includes('20mg')) kitCost = 160;
    else if (norm.includes('10mg')) kitCost = 100;
    else kitCost = 60;
  } else if (norm.includes('retatrutide')) {
    if (norm.includes('100mg')) kitCost = 550;
    else if (norm.includes('60mg')) kitCost = 420;
    else if (norm.includes('50mg')) kitCost = 360;
    else if (norm.includes('30mg')) kitCost = 250;
    else if (norm.includes('20mg')) kitCost = 190;
    else if (norm.includes('10mg')) kitCost = 120;
    else kitCost = 80;
  } else if (norm.includes('tirzepatide')) {
    if (norm.includes('100mg')) kitCost = 480;
    else if (norm.includes('60mg')) kitCost = 350;
    else if (norm.includes('50mg')) kitCost = 300;
    else if (norm.includes('30mg')) kitCost = 220;
    else if (norm.includes('20mg')) kitCost = 160;
    else if (norm.includes('15mg')) kitCost = 130;
    else kitCost = 100;
  } else if (norm.includes('semaglutide')) {
    if (norm.includes('60mg')) kitCost = 320;
    else if (norm.includes('50mg')) kitCost = 280;
    else if (norm.includes('30mg')) kitCost = 190;
    else if (norm.includes('20mg')) kitCost = 150;
    else if (norm.includes('10mg')) kitCost = 100;
    else kitCost = 65;
  } else if (norm.includes('cjc-1295') && norm.includes('ipamorelin')) {
    if (norm.includes('20mg')) kitCost = 200;
    else kitCost = 130;
  } else if (norm.includes('cjc-1295')) {
    if (norm.includes('20mg')) kitCost = 120;
    else kitCost = 80;
  } else if (norm.includes('ipamorelin')) {
    if (norm.includes('20mg')) kitCost = 130;
    else kitCost = 85;
  } else if (norm.includes('tesamorelin')) {
    if (norm.includes('20mg')) kitCost = 180;
    else kitCost = 110;
  } else if (norm.includes('cagrilintide')) {
    if (norm.includes('20mg')) kitCost = 160;
    else if (norm.includes('10mg')) kitCost = 110;
    else kitCost = 80;
  } else if (norm.includes('aod-9604')) {
    if (norm.includes('10mg')) kitCost = 100;
    else kitCost = 70;
  } else if (norm.includes('klow')) {
    kitCost = 180;
  } else if (norm.includes('ghk-cu')) {
    if (norm.includes('100mg')) kitCost = 210;
    else if (norm.includes('50mg')) kitCost = 140;
    else kitCost = 80;
  } else if (norm.includes('melanotan')) {
    if (norm.includes('20mg')) kitCost = 90;
    else kitCost = 50;
  } else if (norm.includes('pt-141')) {
    if (norm.includes('20mg')) kitCost = 100;
    else kitCost = 65;
  } else if (norm.includes('nad+')) {
    if (norm.includes('1000mg')) kitCost = 180;
    else kitCost = 115;
  } else {
    // Fallback: kit cost is 45% of base price * 10
    kitCost = Math.round(basePrice * 0.45 * 10);
  }

  // Cost per vial is kit cost divided by 10
  const baseCostPerVial = kitCost / 10;
  
  // $35 shipping per order placed with KaosLabs. 
  // Add $3.50 per vial to account for that (i.e. distributing/spreading the $35 order shipping per average 10 vial batch size)
  const shippingChargePerVial = 3.50;
  return Number((baseCostPerVial + shippingChargePerVial).toFixed(2));
}

// Sample premium inventory to seed if the catalog is empty - Seeded from certified listings, dosages, and prices
const SAMPLE_INVENTORY: ShopProduct[] = [
  // --- MUSCLE GROWTH ---
  {
    id: 'prod_cjc_ipam_10mg',
    name: 'CJC-1295 (Without DAC) + Ipamorelin (10mg)',
    description: 'A synergistic GH-boosting stack designed to maximize muscle growth, recovery, and anti-aging benefits through natural hormone support.',
    category: 'Muscle Growth',
    price: 104,
    inventory: 20
  },
  {
    id: 'prod_cjc_ipam_20mg',
    name: 'CJC-1295 (Without DAC) + Ipamorelin (20mg)',
    description: 'A synergistic GH-boosting stack designed to maximize muscle growth, recovery, and anti-aging benefits through natural hormone support.',
    category: 'Muscle Growth',
    price: 155,
    inventory: 0
  },
  {
    id: 'prod_cjc_nodac_10mg',
    name: 'CJC-1295 Without DAC (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Tetrasubstituted peptide GHRH analog designed for rapid somatotrope signaling pathways.',
    category: 'Muscle Growth',
    price: 60,
    inventory: 0
  },
  {
    id: 'prod_cjc_nodac_20mg',
    name: 'CJC-1295 Without DAC (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Tetrasubstituted peptide GHRH analog designed for rapid somatotrope signaling pathways.',
    category: 'Muscle Growth',
    price: 92,
    inventory: 0
  },
  {
    id: 'prod_ipam_10mg',
    name: 'Ipamorelin (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Selective GH secretagogue pentapeptide evaluated under clinical modeling.',
    category: 'Muscle Growth',
    price: 66,
    inventory: 0
  },
  {
    id: 'prod_ipam_20mg',
    name: 'Ipamorelin (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Selective GH secretagogue pentapeptide evaluated under clinical modeling.',
    category: 'Muscle Growth',
    price: 102,
    inventory: 0
  },
  {
    id: 'prod_tesa_10mg',
    name: 'Tesamorelin (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Potent GHRH analog researched for somatic growth factors, visceral mass, and peptide signaling.',
    category: 'Muscle Growth',
    price: 77,
    inventory: 0
  },
  {
    id: 'prod_tesa_20mg',
    name: 'Tesamorelin (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Potent GHRH analog researched for somatic growth factors, visceral mass, and peptide signaling.',
    category: 'Muscle Growth',
    price: 117,
    inventory: 0
  },
  {
    id: 'prod_mots_c_10mg',
    name: 'MOTS-C (10mg)',
    description: 'Mitochondrial-derived peptide researched for metabolic optimization, muscle growth energy pathways, cellular vitality, and premium exercise modeling. Supplied in a professional 10 vials/kit box.',
    category: 'Muscle Growth',
    price: 84,
    inventory: 20
  },

  // --- WEIGHT LOSS ---
  {
    id: 'prod_retat_5mg',
    name: 'Retatrutide (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 77,
    inventory: 0
  },
  {
    id: 'prod_retat_10mg',
    name: 'Retatrutide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 117,
    inventory: 10
  },
  {
    id: 'prod_retat_20mg',
    name: 'Retatrutide (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 156,
    inventory: 20
  },
  {
    id: 'prod_retat_30mg',
    name: 'Retatrutide (30mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 197,
    inventory: 0
  },
  {
    id: 'prod_retat_50mg',
    name: 'Retatrutide (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 270,
    inventory: 0
  },
  {
    id: 'prod_retat_60mg',
    name: 'Retatrutide (60mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 309,
    inventory: 0
  },
  {
    id: 'prod_retat_100mg',
    name: 'Retatrutide (100mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 392,
    inventory: 0
  },
  {
    id: 'prod_tirz_10mg',
    name: 'Tirzepatide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 73,
    inventory: 0
  },
  {
    id: 'prod_tirz_15mg',
    name: 'Tirzepatide (15mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 97,
    inventory: 0
  },
  {
    id: 'prod_tirz_20mg',
    name: 'Tirzepatide (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 117,
    inventory: 0
  },
  {
    id: 'prod_tirz_30mg',
    name: 'Tirzepatide (30mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 156,
    inventory: 0
  },
  {
    id: 'prod_tirz_50mg',
    name: 'Tirzepatide (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 196,
    inventory: 0
  },
  {
    id: 'prod_tirz_60mg',
    name: 'Tirzepatide (60mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 235,
    inventory: 0
  },
  {
    id: 'prod_tirz_100mg',
    name: 'Tirzepatide (100mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 337,
    inventory: 0
  },
  {
    id: 'prod_sema_5mg',
    name: 'Semaglutide (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 50,
    inventory: 0
  },
  {
    id: 'prod_sema_10mg',
    name: 'Semaglutide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 73,
    inventory: 0
  },
  {
    id: 'prod_sema_20mg',
    name: 'Semaglutide (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 109,
    inventory: 0
  },
  {
    id: 'prod_sema_30mg',
    name: 'Semaglutide (30mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 144,
    inventory: 0
  },
  {
    id: 'prod_sema_50mg',
    name: 'Semaglutide (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 191,
    inventory: 0
  },
  {
    id: 'prod_sema_60mg',
    name: 'Semaglutide (60mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 219,
    inventory: 0
  },
  {
    id: 'prod_cagri_5mg',
    name: 'Cagrilintide (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Long-acting amylin receptor agonist investigated for metabolic path synergy when co-analyzed with GLP-1 agonists.',
    category: 'Weight Loss',
    price: 58,
    inventory: 0
  },
  {
    id: 'prod_cagri_10mg',
    name: 'Cagrilintide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Long-acting amylin receptor agonist investigated for metabolic path synergy when co-analyzed with GLP-1 agonists.',
    category: 'Weight Loss',
    price: 77,
    inventory: 0
  },
  {
    id: 'prod_cagri_20mg',
    name: 'Cagrilintide (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Long-acting amylin receptor agonist investigated for metabolic path synergy when co-analyzed with GLP-1 agonists.',
    category: 'Weight Loss',
    price: 117,
    inventory: 0
  },
  {
    id: 'prod_aod_5mg',
    name: 'AOD-9604 (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. High-quality synthetic C-terminal fragment of human growth hormone researched for selective lipid metabolism pathways.',
    category: 'Weight Loss',
    price: 55,
    inventory: 0
  },
  {
    id: 'prod_aod_10mg',
    name: 'AOD-9604 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. High-quality synthetic C-terminal fragment of human growth hormone researched for selective lipid metabolism pathways.',
    category: 'Weight Loss',
    price: 75,
    inventory: 0
  },

  // --- HEALING & REPAIR ---
  {
    id: 'prod_bpc_5mg',
    name: 'BPC-157 (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pentadecapeptide investigated for tissue remodeling, gastric protection, tendon, and vascular recovery pathways.',
    category: 'Healing & Repair',
    price: 50,
    inventory: 0
  },
  {
    id: 'prod_bpc_10mg',
    name: 'BPC-157 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pentadecapeptide investigated for tissue remodeling, gastric protection, tendon, and vascular recovery pathways.',
    category: 'Healing & Repair',
    price: 69,
    inventory: 0
  },
  {
    id: 'prod_bpc_20mg',
    name: 'BPC-157 (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pentadecapeptide investigated for tissue remodeling, gastric protection, tendon, and vascular recovery pathways.',
    category: 'Healing & Repair',
    price: 104,
    inventory: 0
  },
  {
    id: 'prod_tb_5mg',
    name: 'TB-500 (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Thymosin Beta-4 synthetic active sequence researched for cellular migration, actin regulation, and wound resolution.',
    category: 'Healing & Repair',
    price: 53,
    inventory: 0
  },
  {
    id: 'prod_tb_10mg',
    name: 'TB-500 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Thymosin Beta-4 synthetic active sequence researched for cellular migration, actin regulation, and wound resolution.',
    category: 'Healing & Repair',
    price: 75,
    inventory: 0
  },
  {
    id: 'prod_tb_20mg',
    name: 'TB-500 (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Thymosin Beta-4 synthetic active sequence researched for cellular migration, actin regulation, and wound resolution.',
    category: 'Healing & Repair',
    price: 112,
    inventory: 0
  },
  {
    id: 'prod_bpc_tb_blend_10mg',
    name: 'BPC-157 / TB-500 Blend (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pre-formulated synergy vial containing 5mg BPC-157 and 5mg TB-500 for cellular and tendon research models.',
    category: 'Healing & Repair',
    price: 73,
    inventory: 0
  },

  // --- BEAUTY & RADIANCE ---
  {
    id: 'prod_klow_80mg',
    name: 'Klow (80mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied as an exclusive beauty and skin radiance regulatory peptide engineered in premium 80mg kits to research dermis remodeling targets.',
    category: 'Beauty & Radiance',
    price: 124,
    inventory: 20
  },
  {
    id: 'prod_ghk_20mg',
    name: 'GHK-Cu (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pure copper tripeptide studied for collagen stimulation, hair follicle integrity, and extracellular matrix remodeling.',
    category: 'Beauty & Radiance',
    price: 61,
    inventory: 0
  },
  {
    id: 'prod_ghk_50mg',
    name: 'GHK-Cu (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pure copper tripeptide studied for collagen stimulation, hair follicle integrity, and extracellular matrix remodeling.',
    category: 'Beauty & Radiance',
    price: 101,
    inventory: 0
  },
  {
    id: 'prod_ghk_100mg',
    name: 'GHK-Cu (100mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pure copper tripeptide studied for collagen stimulation, hair follicle integrity, and extracellular matrix remodeling.',
    category: 'Beauty & Radiance',
    price: 152,
    inventory: 0
  },
  {
    id: 'prod_mt2_10mg',
    name: 'Melanotan II (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Strong alpha-MSH receptor agonist investigated for skin pigment adaptation patterns and photoprotective modeling.',
    category: 'Beauty & Radiance',
    price: 45,
    inventory: 0
  },
  {
    id: 'prod_mt2_20mg',
    name: 'Melanotan II (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Strong alpha-MSH receptor agonist investigated for skin pigment adaptation patterns and photoprotective modeling.',
    category: 'Beauty & Radiance',
    price: 69,
    inventory: 0
  },
  {
    id: 'prod_pt141_10mg',
    name: 'PT-141 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Bremelanotide synthetic candidate studied for melanocortin receptor activation pathways and autonomic vascular regulation.',
    category: 'Beauty & Radiance',
    price: 50,
    inventory: 10
  },
  {
    id: 'prod_pt141_20mg',
    name: 'PT-141 (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Bremelanotide synthetic candidate studied for melanocortin receptor activation pathways and autonomic vascular regulation.',
    category: 'Beauty & Radiance',
    price: 73,
    inventory: 0
  },
  {
    id: 'prod_nad_500mg',
    name: 'NAD+ (500mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pure Nicotinamide Adenine Dinucleotide studied for sirtuin path signaling, cell energy charging, and biochemical integrity.',
    category: 'Beauty & Radiance',
    price: 79,
    inventory: 10
  },
  {
    id: 'prod_nad_1000mg',
    name: 'NAD+ (1000mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pure Nicotinamide Adenine Dinucleotide studied for sirtuin path signaling, cell energy charging, and biochemical integrity.',
    category: 'Beauty & Radiance',
    price: 128,
    inventory: 0
  },

  // --- COGNITIVE & FOCUS ---
  {
    id: 'prod_semax_selank_blend_20mg',
    name: 'Neuro-Focus Semax + Selank (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Synergy duo blend pairing Semax with Selank. Studied for memory executive speeds and anxiety resistance pathways.',
    category: 'Cognitive & Focus',
    price: 95,
    inventory: 0
  },
  {
    id: 'prod_semax_10mg',
    name: 'Semax (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Upregulates Brain-Derived Neurotrophic Factor (BDNF) and NGF. Studied for executive cognitive signaling.',
    category: 'Cognitive & Focus',
    price: 62,
    inventory: 0
  },
  {
    id: 'prod_selank_10mg',
    name: 'Selank (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Synthetic tuftsin neuroregulatory peptide. Studied for GABAergic stabilization and focused analytical performance.',
    category: 'Cognitive & Focus',
    price: 59,
    inventory: 0
  },

  // --- LONGEVITY & CELLULAR ---
  {
    id: 'prod_epitalon_10mg',
    name: 'Epitalon (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Pineal gland hormone secretagogue regulator tetrapeptide researched for telomerase enzyme signaling pathways.',
    category: 'Longevity & Cellular',
    price: 58,
    inventory: 0
  },
  {
    id: 'prod_epitalon_50mg',
    name: 'Epitalon (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Pineal gland secretagogue regulator tetrapeptide studied in higher-concentration telomere lengthening research models.',
    category: 'Longevity & Cellular',
    price: 120,
    inventory: 0
  },
  {
    id: 'prod_ss31_10mg',
    name: 'SS-31 (Elamipretide) (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Mitochondria-targeting tetrapeptide researched for cardiolipin integrity, ROS mitigation, and energetic ATP balance.',
    category: 'Longevity & Cellular',
    price: 89,
    inventory: 0
  },

  // --- IMMUNE & HEALTH ---
  {
    id: 'prod_ta1_10mg',
    name: 'Thymosin Alpha-1 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Active sequence mature phenolic thymic peptide studied for selective T-cell, cytotoxic, and helper activation.',
    category: 'Immune & Health',
    price: 65,
    inventory: 0
  },
  {
    id: 'prod_kpv_10mg',
    name: 'KPV Peptide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Tripeptide fragment of alpha-MSH, researched for cell-specific NF-kB metabolic block and gastrointestinal soothing.',
    category: 'Immune & Health',
    price: 48,
    inventory: 0
  },

  // --- SLEEP & RECOVERY ---
  {
    id: 'prod_dsip_10mg',
    name: 'DSIP (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Delta Sleep-Inducing Peptide. Pure somnotropic peptide studied for slow-wave delta rhythms and biorhythm adjustment.',
    category: 'Sleep & Recovery',
    price: 54,
    inventory: 0
  },

  // --- RECONSTITUTION SOLVENTS ---
  {
    id: 'prod_bac_water_30ml',
    name: 'BAC Water (30ml)',
    description: 'Reconstitution Solvent grade. Benzyl alcohol preserved. Engineered sterile solvent standard required for scientific reconstitution of delicate peptide research compounds.',
    category: 'Reconstitution Solvents',
    price: 18,
    inventory: 0
  }
];

// Helper to clean descriptions to strictly match single vial sales rate
export function getCleanDescription(desc: string): string {
  if (!desc) return '';
  let clean = desc
    .replace(/Supplied in a professional 10 vials\/kit box\./gi, 'Supplied as 1 individual high-purity 3ml research vial (price is per single vial).')
    .replace(/Supplied as an exclusive beauty and skin radiance regulatory peptide engineered in premium 80mg kits/gi, 'Supplied as 1 individual high-purity 3ml research vial (price is per single vial).');

  if (!clean.includes('vial') && !clean.includes('Vial') && !clean.includes('Reconstitution Solvent')) {
    clean += ' Supplied as 1 individual high-purity 3ml research vial.';
  }
  return clean;
}

// Helper to calculate business day dates
export const getEstimatedDeliveryDate = (minDays: number, maxDays: number) => {
  const getFormattedDate = (days: number) => {
    const d = new Date();
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) { // Skip Sat/Sun
        added++;
      }
    }
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  if (minDays === maxDays) {
    return getFormattedDate(minDays);
  }
  return `${getFormattedDate(minDays)} – ${getFormattedDate(maxDays)}`;
};

export interface ShippingOption {
  id: string;
  carrier: 'USPS' | 'UPS';
  name: string;
  cost: number;
  transitDaysMin: number;
  transitDaysMax: number;
  estimatedDeliveryDate: string;
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

  // Weight Calculation: 4oz packaging base + 1.5oz per active vial
  const totalWeightOz = 4 + (totalVials * 1.5);
  const weightLbs = Math.round((totalWeightOz / 16) * 10) / 10;

  // Free shipping check logic
  const nonBacItems = cart.filter(item => item.product.id !== 'prod_bac_water_30ml');
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
    options: options.map(opt => ({
      ...opt,
      cost: Math.round(opt.cost * 100) / 100
    })),
    zoneName,
    weightLbs,
    isFreeShipping,
    nonBacVialsCount,
    nonBacSubtotal
  };
};

// 15% site-wide discount helper
export function getSalePrice(price: number): number {
  return Math.round(price * 0.85);
}

export default function MembersShop() {
  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser);
  const [labratTheme, setLabratTheme] = useState<LabratThemeMode>(() => resolveLabratTheme());
  
  const renderWithLabRatBranding = (text: string) => {
    if (!text || !text.includes('LabRat')) return text;
    const parts = text.split('LabRat');
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="font-sans font-black tracking-tighter bg-gradient-to-r from-[#00c5f5] via-[#2176ff] to-[#a05eff] bg-clip-text text-transparent uppercase select-none inline-block">LABRAT</span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  const [isAdminPreviewCustomer, setIsAdminPreviewCustomer] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const syncTheme = () => setLabratTheme(resolveLabratTheme());
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-labrat-theme']
    });

    window.addEventListener('storage', syncTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setCurrentUser(u);
    });
    return () => unsubscribe();
  }, []);

  const isAdminUser = currentUser?.email?.toLowerCase() === 'kyleheiser@gmail.com';
  const isViewingAsAdmin = isAdminUser && !isAdminPreviewCustomer;

  // Application Layout Views
  // Users view: 'catalog' | 'cart' | 'checkout' | 'orders' | 'status_check'
  // Admin view: 'admin_members' | 'admin_orders' | 'admin_products'
  const [view, setView] = useState<string>('catalog');
  const [showCertifications, setShowCertifications] = useState<boolean>(false);
  const [selectedCertKey, setSelectedCertKey] = useState<string | null>(null);
  const [showNorwayModal, setShowNorwayModal] = useState<boolean>(false);

  useEffect(() => {
    if (isAdminUser && !isAdminPreviewCustomer) {
      setView(v => ['admin_members', 'admin_orders', 'catalog'].includes(v) ? v : 'admin_members');
    } else {
      setView(v => ['catalog', 'cart', 'orders'].includes(v) ? v : 'catalog');
    }
  }, [isAdminUser, isAdminPreviewCustomer]);
  
  // Database States
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [allOrdersGlobal, setAllOrdersGlobal] = useState<OrderDetail[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Record<string, string>>({});

  // Immersive Compound Dosages selector modal state
  const [selectedParentProductGroup, setSelectedParentProductGroup] = useState<{
    baseName: string;
    category: string;
    description: string;
    options: (ShopProduct & { size: string })[];
  } | null>(null);
  const [selectedOptionIdInDrawer, setSelectedOptionIdInDrawer] = useState<string>('');
  const [drawerQuantity, setDrawerQuantity] = useState<number>(1);

  useEffect(() => {
    if (products.length > 0) {
      setSelectedProductIds(prev => {
        const next = { ...prev };
        products.forEach(p => {
          const { baseName } = getProductBaseAndSize(p.name);
          
          // Find all sizes of this compound name and sort by in-stock status (highest priority), then by price
          const sameCompound = products.filter(item => {
            const info = getProductBaseAndSize(item.name);
            return info.baseName === baseName;
          });
          sameCompound.sort((a, b) => {
            const stockA = getProductAvailableStock(a.id, a.inventory);
            const stockB = getProductAvailableStock(b.id, b.inventory);
            const hasA = stockA > 0 ? 1 : 0;
            const hasB = stockB > 0 ? 1 : 0;
            if (hasA !== hasB) {
              return hasB - hasA; // prioritize in stock
            }
            return a.price - b.price;
          });
          
          const bestOptionId = sameCompound[0]?.id;

          if (!next[baseName]) {
            if (bestOptionId) {
              next[baseName] = bestOptionId;
            }
          } else {
            const currentSelectedId = next[baseName];
            const currentSelectedOption = sameCompound.find(item => item.id === currentSelectedId);
            const currentStock = currentSelectedOption ? getProductAvailableStock(currentSelectedOption.id, currentSelectedOption.inventory) : 0;
            
            // Auto-heal and switch to in-stock size if currently selected is out-of-stock but an in-stock size is available
            const bestStock = sameCompound[0] ? getProductAvailableStock(bestOptionId, sameCompound[0].inventory) : 0;
            if (currentStock <= 0 && bestStock > 0 && bestOptionId) {
              next[baseName] = bestOptionId;
            }
          }
        });
        return next;
      });
    }
  }, [products, allOrdersGlobal]);
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [adminMembersList, setAdminMembersList] = useState<MemberProfile[]>([]);
  const [adminOrdersList, setAdminOrdersList] = useState<OrderDetail[]>([]);
  const pendingApprovalCount = adminMembersList.filter(member => member.status === 'pending').length;
  const newOrderCount = adminOrdersList.filter(order => order.status === 'placed').length;
  
  // Loading states
  const [profileLoading, setProfileLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showShopSuggestions, setShowShopSuggestions] = useState(false);

  // Registration / Join Waitlist inputs
  const [joinForm, setJoinForm] = useState({
    shippingAddress: '',
    phone: ''
  });

  // Shipping details for checkout inputs
  const [shippingForm, setShippingForm] = useState({
    fullName: currentUser?.displayName || '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    notes: ''
  });

  // Shipping Carrier and Rates states
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string>('usps_ground');
  const [shippingCarrierFilter, setShippingCarrierFilter] = useState<'ALL' | 'USPS' | 'UPS'>('ALL');

  // Local Shopping Cart State (Cached in LocalStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = safeLocalStorage.getItem('labrat_member_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Active Order Success Feedback Modals
  const [lastPlacedOrder, setLastPlacedOrder] = useState<OrderDetail | null>(null);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);

  // Dynamic Product Creator inputs (Admin Only)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);
  const [confirmDeleteMemberId, setConfirmDeleteMemberId] = useState<string | null>(null);
  const [productValidationError, setProductValidationError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    inventory: 50
  });

  // Fetch Member Profile Approval status from firestore
  useEffect(() => {
    if (!currentUser) {
      setProfileLoading(false);
      return;
    }

    const fetchProfileAndInit = async () => {
      setProfileLoading(true);
      try {
        const profilRef = doc(db, 'members', currentUser.uid);
        const profilSnap = await getDoc(profilRef);
        
        if (profilSnap.exists()) {
          const profileData = profilSnap.data() as MemberProfile;
          setMemberProfile(profileData);
          setJoinForm({
            shippingAddress: profileData.shippingAddress || '',
            phone: profileData.phone || ''
          });
          const parsed = parseShippingAddress(profileData.shippingAddress || '');
          setShippingForm(prev => ({
            ...prev,
            fullName: prev.fullName || currentUser.displayName || '',
            addressLine1: parsed.addressLine1 || '',
            city: parsed.city || '',
            state: parsed.state || '',
            zipCode: parsed.zipCode || '',
            phone: profileData.phone || prev.phone || ''
          }));
        } else {
          setMemberProfile(null);
        }
      } catch (e) {
        console.error('Error fetching member verification status', e);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfileAndInit();
  }, [currentUser]);

  // Sync Cart to LocalStorage
  useEffect(() => {
    safeLocalStorage.setItem('labrat_member_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch all orders globally to calculate dynamic inventory
  const fetchGlobalOrders = async () => {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const list: OrderDetail[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as OrderDetail);
      });
      setAllOrdersGlobal(list);
    } catch (e) {
      console.warn('Failed to fetch global orders (expected for pending/non-member users):', e);
    }
  };

  // Unified available stock computer (takes base product stock and subtracting quantities from active orders)
  function getProductAvailableStock(prodId: string, baseInventory: number): number {
    let stock = baseInventory;
    
    allOrdersGlobal.forEach(order => {
      const item = order.items?.find((i: any) => i.id === prodId);
      if (item) {
        // Parse order date
        const orderDate = new Date(order.createdAt);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        
        const isUnpaidAndExpired = order.paymentStatus !== 'paid' && orderDate < fourteenDaysAgo;
        
        // Only deduct if order is active (not unpaid & expired)
        if (!isUnpaidAndExpired) {
          stock -= item.quantity;
        }
      }
    });
    
    return Math.max(0, stock);
  }

  // Load Inventory Catalog
  const fetchProducts = async () => {
    setCatalogLoading(true);
    try {
      await fetchGlobalOrders();
      
      const colRef = collection(db, 'shopItems');
      const snap = await getDocs(colRef);
      const list: ShopProduct[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ShopProduct);
      });

      // Self-healing synchronization upgrade: insert or UPDATE items to match updated clean certified titles & sizes, prices, and stock
      for (const sample of SAMPLE_INVENTORY) {
        const existingIndex = list.findIndex(p => p.id === sample.id);
        if (existingIndex === -1) {
          try {
            await setDoc(doc(db, 'shopItems', sample.id), sample);
            list.push(sample);
          } catch (err) {
            console.error(`Failed to auto-provision item: ${sample.id}`, err);
          }
        } else {
          const existing = list[existingIndex];
          if (
            existing.name !== sample.name || 
            existing.description !== sample.description || 
            existing.category !== sample.category ||
            existing.price !== sample.price ||
            existing.inventory !== sample.inventory
          ) {
            try {
              await setDoc(doc(db, 'shopItems', sample.id), {
                ...existing,
                name: sample.name,
                description: sample.description,
                category: sample.category,
                price: sample.price,
                inventory: sample.inventory
              });
              list[existingIndex] = {
                ...existing,
                name: sample.name,
                description: sample.description,
                category: sample.category,
                price: sample.price,
                inventory: sample.inventory
              };
            } catch (err) {
              console.error(`Failed to auto-update item: ${sample.id}`, err);
            }
          }
        }
      }

      // Proactively prune outdated/removed inventory sizes/products from Firestore
      const activeSampleIds = SAMPLE_INVENTORY.map(s => s.id);
      const obsoleteItems = list.filter(item => !activeSampleIds.includes(item.id));
      await Promise.all(
        obsoleteItems.map(item =>
          deleteDoc(doc(db, 'shopItems', item.id)).catch(err =>
            console.error(`Failed to auto-delete obsolete database item: ${item.id}`, err)
          )
        )
      );

      // Set state to strictly only contain active shop products
      const filteredList = list.filter(p => activeSampleIds.includes(p.id));
      setProducts(filteredList);
    } catch (e) {
      console.error('Failed fetching shop inventory', e);
      handleFirestoreError(e, OperationType.LIST, 'shopItems');
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    // Only load catalog if the user is verified/approved or an Admin
    if (isAdminUser || (memberProfile && memberProfile.status === 'approved')) {
      fetchProducts();
    }
  }, [memberProfile, isAdminUser]);

  // Fetch User's Orders history
  const fetchUserOrders = async () => {
    if (!currentUser) return;
    setOrdersLoading(true);
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const list: OrderDetail[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as OrderDetail);
      });
      // Sort orders descending by date / ID
      list.sort((a,b) => b.id.localeCompare(a.id));
      setOrders(list);
    } catch (e) {
      console.error('Failed loading order history', e);
      handleFirestoreError(e, OperationType.LIST, 'orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'orders') {
      fetchUserOrders();
    }
  }, [view]);

  // Auto-scroll up to show purchased items, order status, or when checking/updating shipping address details
  useEffect(() => {
    if (view === 'checkout' || view === 'orders' || view === 'cart' || showOrderSuccessModal) {
      setTimeout(() => {
        const anchor = document.getElementById('shop-viewport-anchor');
        if (anchor) {
          anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  }, [view, showOrderSuccessModal]);

  // Loading Admin datasets
  const fetchAdminData = async () => {
    if (!isAdminUser) return;

    const shouldShowMemberSpinner = view === 'admin_members';
    const shouldShowOrderSpinner = view === 'admin_orders';

    if (shouldShowMemberSpinner) setMembersLoading(true);
    if (shouldShowOrderSpinner) setOrdersLoading(true);

    try {
      const snap = await getDocs(collection(db, 'members'));
      const list: MemberProfile[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as MemberProfile);
      });
      list.sort((a, b) => {
        const rank: Record<MemberProfile['status'], number> = { pending: 0, approved: 1, blocked: 2 };
        const statusRank = rank[a.status] - rank[b.status];
        if (statusRank !== 0) return statusRank;
        return (b.updatedAt || b.createdAt || '').toString().localeCompare((a.updatedAt || a.createdAt || '').toString());
      });
      setAdminMembersList(list);
    } catch (e) {
      console.error('Failed fetching member registrations', e);
      handleFirestoreError(e, OperationType.LIST, 'members');
    } finally {
      if (shouldShowMemberSpinner) setMembersLoading(false);
    }

    try {
      const snap = await getDocs(collection(db, 'orders'));
      const list: OrderDetail[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as OrderDetail);
      });
      list.sort((a, b) => b.id.localeCompare(a.id));
      setAdminOrdersList(list);
    } catch (e) {
      console.error('Failed loading all retail orders', e);
      handleFirestoreError(e, OperationType.LIST, 'orders');
    } finally {
      if (shouldShowOrderSpinner) setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUser) {
      fetchAdminData();
    }
  }, [view, isAdminUser]);

  // Seeding Catalog with default products (Admin Only)
  const handleSeedDatabase = async () => {
    triggerHaptic('medium');
    setActionLoading('seed');
    try {
      for (const item of SAMPLE_INVENTORY) {
        await setDoc(doc(db, 'shopItems', item.id), item);
      }
      await fetchProducts();
    } catch (e) {
      console.error('Failed seeding products catalog', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Submit Membership Application
  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    triggerHaptic('medium');
    setActionLoading('join');
    try {
      const ref = doc(db, 'members', currentUser.uid);
      const payload: MemberProfile = {
        id: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Anonymous LabRat',
        status: 'pending',
        shippingAddress: joinForm.shippingAddress,
        phone: joinForm.phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(ref, payload);
      setMemberProfile(payload);
      const parsed = parseShippingAddress(payload.shippingAddress || '');
      setShippingForm(prev => ({
        ...prev,
        fullName: prev.fullName || currentUser.displayName || '',
        addressLine1: parsed.addressLine1 || '',
        city: parsed.city || '',
        state: parsed.state || '',
        zipCode: parsed.zipCode || '',
        phone: payload.phone || prev.phone || ''
      }));
    } catch (err) {
      console.error('Error submitting application', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Admin approval mechanics
  const handleSetMemberStatus = async (userId: string, status: 'pending' | 'approved' | 'blocked') => {
    triggerHaptic('light');
    setActionLoading(`member_${userId}_${status}`);
    try {
      const ref = doc(db, 'members', userId);
      await updateDoc(ref, { 
        status,
        updatedAt: new Date().toISOString()
      });
      // Update local admin state cleanly
      setAdminMembersList(prev => prev.map(m => m.id === userId ? { ...m, status } : m));
    } catch (e) {
      console.error('Failed to change member privilege', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Admin deletion mechanics: removes the user's shop member profile/application.
  // This does not delete their Firebase Authentication account, which requires server-side admin privileges.
  const handleDeleteMemberProfile = async (userId: string) => {
    triggerHaptic('medium');
    setActionLoading(`member_${userId}_delete`);
    try {
      await deleteDoc(doc(db, 'members', userId));
      setAdminMembersList(prev => prev.filter(m => m.id !== userId));
      setConfirmDeleteMemberId(current => current === userId ? null : current);
    } catch (e) {
      console.error('Failed to delete member profile', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Order status transitions (Admin Only)
  const handleUpdateOrderStatus = async (orderId: string, status: OrderDetail['status']) => {
    triggerHaptic('light');
    setActionLoading(`order_${orderId}_${status}`);
    try {
      const ref = doc(db, 'orders', orderId);
      await updateDoc(ref, { status });
      setAdminOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setAllOrdersGlobal(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (e) {
      console.error('Failed changing order status flag', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete order (Admin Only)
  const handleDeleteOrder = async (orderId: string) => {
    triggerHaptic('medium');
    setActionLoading(`delete_order_${orderId}`);
    try {
      const ref = doc(db, 'orders', orderId);
      await deleteDoc(ref);
      setAdminOrdersList(prev => prev.filter(o => o.id !== orderId));
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setAllOrdersGlobal(prev => prev.filter(o => o.id !== orderId));
    } catch (e) {
      console.error('Failed deleting order', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Seeding sample order for KyleHeiser@gmail.com
  const handleSeedDemoOrder = async () => {
    triggerHaptic('success');
    setActionLoading('seed_order');
    try {
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const emailToUse = 'KyleHeiser@gmail.com';
      const orderPayload: any = {
        userId: currentUser?.uid || 'demo_kyle_user_id',
        email: emailToUse,
        displayName: currentUser?.displayName || 'Kyle Heiser',
        items: [
          {
            id: 'sample_bpc_157',
            name: 'BPC-157 / TB-500 Blend (10mg)',
            price: 110,
            quantity: 2
          },
          {
            id: 'sample_tirzepatide',
            name: 'Tirzepatide (30mg)',
            price: 380,
            quantity: 1
          }
        ],
        total: 600,
        shippingInfo: {
          fullName: 'Kyle Heiser',
          addressLine1: '456 Biotech Research Plaza, Suite C',
          city: 'Boston',
          state: 'MA',
          zipCode: '02111',
          phone: '(555) 789-1234',
          notes: 'Deliver to secure secondary research refrigerator. Standard cold-chain shipping.'
        },
        status: 'placed',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'orders', orderId), orderPayload);
      
      const newOrderWithId = { id: orderId, ...orderPayload } as OrderDetail;
      setAdminOrdersList(prev => [newOrderWithId, ...prev]);
      setOrders(prev => [newOrderWithId, ...prev]);
    } catch (e) {
      console.error('Failed to seed demo order', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Mark order as paid
  const handleMarkAsPaid = async (orderId: string) => {
    triggerHaptic('success');
    setActionLoading(`pay_${orderId}`);
    try {
      const ref = doc(db, 'orders', orderId);
      await updateDoc(ref, {
        paymentStatus: 'paid',
        status: 'processing'
      });
      setAdminOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid', status: 'processing' } : o));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid', status: 'processing' } : o));
      setAllOrdersGlobal(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid', status: 'processing' } : o));
    } catch (e) {
      console.error('Failed updating payment status', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Submit tracking details and transition to 'shipped'
  const handleShipOrder = async (orderId: string, trackingNumber: string) => {
    triggerHaptic('success');
    setActionLoading(`ship_${orderId}`);
    try {
      const ref = doc(db, 'orders', orderId);
      await updateDoc(ref, {
        status: 'shipped',
        trackingNumber,
        trackingStatus: 'shipped'
      });
      setAdminOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped', trackingNumber, trackingStatus: 'shipped' } : o));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped', trackingNumber, trackingStatus: 'shipped' } : o));
    } catch (e) {
      console.error('Failed updating tracking details', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Simulated Carrier Delivery check
  const handleSimulateDeliveryCheck = async (orderId: string) => {
    triggerHaptic('success');
    setActionLoading(`check_${orderId}`);
    try {
      // Short delay to simulate API verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ref = doc(db, 'orders', orderId);
      await updateDoc(ref, {
        status: 'completed',
        trackingStatus: 'delivered'
      });
      setAdminOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed', trackingStatus: 'delivered' } : o));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed', trackingStatus: 'delivered' } : o));
    } catch (e) {
      console.error('Failed simulating carrier delivery update', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Add Item to Shopping Cart
  const handleAddToCart = (product: ShopProduct) => {
    triggerHaptic('light');
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Adjust cart quantity
  const handleAdjustQuantity = (productId: string, delta: number) => {
    triggerHaptic('light');
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Remove item completely
  const handleRemoveFromCart = (productId: string) => {
    triggerHaptic('medium');
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Get total items and checkout price
  const getCartTotals = () => {
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.reduce((acc, item) => acc + (getSalePrice(item.product.price) * item.quantity), 0);
    return { totalQty, subtotal };
  };

  // Checkout order placement!
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (cart.length === 0) return;

    triggerHaptic('heavy');
    setActionLoading('checkout');
    
    // Generate order ID
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
    const orderId = `LR-${dateStr}-${randomHex}`;

    const { subtotal } = getCartTotals();
    const totalVials = cart.reduce((sum, item) => sum + item.quantity, 0);
    const shippingDetails = getShippingOptions(shippingForm.zipCode, totalVials, cart);
    const selectedOption = shippingDetails.options.find(o => o.id === selectedShippingOptionId) || shippingDetails.options[0];
    const shippingCost = selectedOption ? selectedOption.cost : 0;

    // Florida sales tax check (6.0%)
    const isFlorida = shippingForm.state.trim().toLowerCase() === 'fl' || shippingForm.state.trim().toLowerCase() === 'florida';
    const salesTaxRate = 0.06;
    const salesTax = isFlorida ? Math.round(subtotal * salesTaxRate * 100) / 100 : 0;

    const orderPayload: OrderDetail = {
      id: orderId,
      userId: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || 'Anonymous LabRat',
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: getSalePrice(item.product.price),
        quantity: item.quantity
      })),
      total: subtotal + shippingCost + salesTax,
      tax: salesTax,
      shippingInfo: { 
        ...shippingForm,
        carrier: selectedOption?.carrier,
        method: selectedOption?.name,
        cost: selectedOption?.cost,
        deliveryEstimate: selectedOption?.estimatedDeliveryDate,
        weightLbs: shippingDetails.weightLbs
      },
      status: 'placed',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'orders', orderId), orderPayload);
      
      // Update global orders state to recalculate inventory instantly
      setAllOrdersGlobal(prev => [orderPayload, ...prev]);
      
      // Complete! Reset parameters
      setLastPlacedOrder(orderPayload);
      setCart([]);
      setShowOrderSuccessModal(true);
      setView('catalog');
    } catch (e) {
      console.error('Error recording retail order', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Admin Catalog CRUD - Add/Edit Products
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    setProductValidationError(null);
    setActionLoading('save_product');
    
    // 10mg / 20mg Gap Validation
    const info = getProductBaseAndSize(productForm.name);
    const formPrice = Number(productForm.price);
    const sizeLower = info.size.toLowerCase();
    
    if (sizeLower === '10mg' || sizeLower === '20mg') {
      const otherSize = sizeLower === '10mg' ? '20mg' : '10mg';
      const existingOther = products.find(p => {
        const pInfo = getProductBaseAndSize(p.name);
        return pInfo.baseName === info.baseName && pInfo.size.toLowerCase() === otherSize && p.id !== (editingProduct?.id || '');
      });
      
      if (existingOther) {
        if (sizeLower === '10mg') {
          // This is 10mg, existingOther is 20mg
          const gap = existingOther.price - formPrice;
          if (gap <= 2) {
            setProductValidationError(`Pricing Gap Rule: The 10mg option cannot be within $2 of the 20mg option. Currently, 20mg is $${existingOther.price}, so 10mg must be less than $${existingOther.price - 2}. (Current gap: $${gap.toFixed(2)})`);
            setActionLoading(null);
            return;
          }
        } else {
          // This is 20mg, existingOther is 10mg
          const gap = formPrice - existingOther.price;
          if (gap <= 2) {
            setProductValidationError(`Pricing Gap Rule: The 20mg option must be at least $2.01 more expensive than the 10mg option. Currently, 10mg is $${existingOther.price}, so 20mg must be at least $${existingOther.price + 3}. (Current gap: $${gap.toFixed(2)})`);
            setActionLoading(null);
            return;
          }
        }
      }
    }
    
    const productId = editingProduct ? editingProduct.id : `prod_${Date.now()}`;
    const targetProduct: ShopProduct = {
      id: productId,
      name: productForm.name,
      description: productForm.description,
      category: productForm.category,
      price: formPrice,
      inventory: Number(productForm.inventory)
    };

    try {
      await setDoc(doc(db, 'shopItems', productId), targetProduct);
      await fetchProducts();
      setShowProductModal(false);
      setEditingProduct(null);
      setProductValidationError(null);
      setProductForm({ name: '', description: '', category: '', price: 0, inventory: 50 });
    } catch (e) {
      console.error('Failed logging product catalog', e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    triggerHaptic('medium');
    try {
      await deleteDoc(doc(db, 'shopItems', id));
      await fetchProducts();
    } catch (e) {
      console.error('Failed removing product catalog', e);
    }
  };

  // Get unique category list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products by category and query
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const { totalQty, subtotal } = getCartTotals();

  return (
    <div className="flex flex-col gap-6" id="members-shop-root">
      
      {/* Upper Status Cards / Welcome banners */}
      <div className="bg-[#0b1329] border border-[#1e293b] rounded-xl p-4 sm:p-5 relative overflow-hidden" id="shop-welcome-hero">
        <div className="absolute top-0 right-0 p-6 opacity-5 text-slate-100 pointer-events-none">
          <ShoppingBag className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('authorized_supply'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/10 animate-pulse transition hover:scale-105 active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              >
                Authorized Lab Supply
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('research_only'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/10 transition hover:scale-105 active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              >
                🔬 Research Use Only
              </button>
              {isAdminUser && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-red-500/20 text-red-300 border border-red-500/10">
                  Site Administrator
                </span>
              )}
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('99_purity'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1 transition hover:scale-105 active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              >
                <BadgeCheck className="w-2.5 h-2.5 shrink-0" /> 99% Purity
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('certified_source'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 transition hover:scale-105 active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              >
                <CheckCircle className="w-2.5 h-2.5 shrink-0" /> Certified Source
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('coas_available'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 transition hover:scale-105 active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              >
                <ClipboardList className="w-2.5 h-2.5 shrink-0" /> COAs Available
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('sop_verified'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 transition hover:scale-105 active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              >
                SOP Verified
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('iso_17025'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-800/60 text-slate-300 border border-slate-700/60 transition hover:scale-105 active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                title="ISO/IEC 17025 Lab Competence (Click for details)"
              >
                ISO 17025
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('iso_9001'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-800/60 text-slate-300 border border-slate-700/60 transition hover:scale-105 active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                title="ISO 9001:2015 Quality Management (Click for details)"
              >
                ISO 9001
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('eu_gmp'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-800/60 text-slate-300 border border-slate-700/60 transition hover:scale-105 active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                title="EU GMP Annex 1 Sterile formulation protocols (Click for details)"
              >
                EU GMP Annex 1
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('annex_11'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-800/60 text-slate-300 border border-slate-700/60 transition hover:scale-105 active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                title="Annex 11 Systems electronic security & audit loops (Click for details)"
              >
                Annex 11
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setSelectedCertKey('gdp'); }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-slate-800/60 text-slate-300 border border-slate-700/60 transition hover:scale-105 active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-slate-500/30"
                title="Good Distribution Practice sterile shipping standard (Click for details)"
              >
                GDP Standard
              </button>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-white font-sans uppercase">LABRAT</span>
              <span className="text-white">Bioresearch Peptide &amp; Compound Shop</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Authentic bioresearch peptides and protocols for approved laboratory accounts. <strong className="text-amber-400">Strictly for research use only.</strong>
            </p>
          </div>

          {/* Quick toggle navigation for user modes vs admin modes */}
          <div className="flex items-center gap-2 self-start md:self-center">
            {isAdminUser ? (
              isAdminPreviewCustomer ? (
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1 flex-wrap">
                  <button 
                    onClick={() => { triggerHaptic('light'); setView('catalog'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${view === 'catalog' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Catalog
                  </button>
                  <button 
                    onClick={() => { triggerHaptic('light'); setView('cart'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 relative cursor-pointer ${view === 'cart' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Cart
                    {totalQty > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                        {totalQty}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => { triggerHaptic('light'); setView('orders'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${view === 'orders' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" /> My Orders
                  </button>
                  <div className="w-px h-5 bg-slate-800 self-center mx-1 hidden sm:block" />
                  <button 
                    onClick={() => { triggerHaptic('light'); setIsAdminPreviewCustomer(false); }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-all cursor-pointer"
                  >
                    Back to Admin Panel
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1 flex-wrap">
                  <button 
                    onClick={() => { triggerHaptic('light'); setView('admin_members'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 relative ${view === 'admin_members' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <span>Accounts Approval</span>
                    {pendingApprovalCount > 0 && (
                      <span className="min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-black leading-none flex items-center justify-center shadow-[0_0_14px_rgba(239,68,68,0.45)] animate-pulse">
                        {pendingApprovalCount > 99 ? '99+' : pendingApprovalCount}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => { triggerHaptic('light'); setView('admin_orders'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 relative ${view === 'admin_orders' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <span>Global Orders</span>
                    {newOrderCount > 0 && (
                      <span className="min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black leading-none flex items-center justify-center shadow-[0_0_14px_rgba(251,191,36,0.45)] animate-pulse">
                        {newOrderCount > 99 ? '99+' : newOrderCount}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => { triggerHaptic('light'); setView('catalog'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${['catalog', 'admin_products'].includes(view) ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Manage Products
                  </button>
                  <button 
                    type="button"
                    onClick={() => { triggerHaptic('light'); setView('cart'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 relative cursor-pointer ${view === 'cart' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Cart
                    {totalQty > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                        {totalQty}
                      </span>
                    )}
                  </button>
                  <div className="w-px h-5 bg-slate-800 self-center mx-1 hidden sm:block" />
                  <button 
                    onClick={() => { triggerHaptic('light'); setIsAdminPreviewCustomer(true); setView('catalog'); }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Shop as Customer
                  </button>
                </div>
              )
            ) : (
              memberProfile && memberProfile.status === 'approved' && (
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1">
                  <button 
                    onClick={() => { triggerHaptic('light'); setView('catalog'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${view === 'catalog' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Catalog
                  </button>
                  <button 
                    onClick={() => { triggerHaptic('light'); setView('cart'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 relative cursor-pointer ${view === 'cart' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Cart
                    {totalQty > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                        {totalQty}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => { triggerHaptic('light'); setView('orders'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${view === 'orders' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" /> My Orders
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Anchor point for high-fidelity scrolling directly to the forms/lists */}
      <div id="shop-viewport-anchor" className="scroll-mt-10 h-0 w-full" />

      {/* RENDER LOGIC BY STATES */}

      {profileLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0f172a]/30 border border-[#1e293b]/70 rounded-2xl" id="loading-spinner-wrapper">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Synchronizing membership credentials...</p>
        </div>
      ) : !currentUser ? (
        /* Display auth prompt if user not logged in */
        <div className="bg-[#0a0f1d] border border-red-500/20 rounded-2xl p-8 text-center flex flex-col items-center py-16" id="unauthenticated-shop-state">
          <div className="p-4 bg-red-500/10 text-red-400 rounded-full mb-4">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Login Credentials Required</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
            Viewing and placing chemical requests on the LabRat network requires authenticating with your account in the checklist tab.
          </p>
        </div>
      ) : !isAdminUser && !memberProfile ? (
        /* PROFILE NOT REQUESTED YET: SHOW REGISTER SHEET */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="shop-registration-lobby">
          <div className="bg-[#0f172a]/50 border border-[#1e293b]/80 p-6 sm:p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl self-start mb-4 w-fit">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">Request Member Shopping Access</h2>
              <p className="text-slate-400 text-sm mt-3 leading-linear">
                Our materials are formulated and reserved for registered biochemical researchers. 
                Applying is free. The administrator will review your contact credentials and approve your account, granting access to premium items.
              </p>
              
              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  No direct credit card upfront. Payments handled afterwards via verified email invoices.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  Premium logistics tracking directly on your dashboard.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  Priority stock reservation matching active planned compounds.
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#0b1329]/70 border border-[#1e293b] p-6 sm:p-8 rounded-2xl">
            <h3 className="text-base font-bold text-white mb-4">Researcher Address Registry</h3>
            <form onSubmit={handleJoinWaitlist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="reg-email">Verified Email</label>
                <input 
                  type="email" 
                  disabled 
                  value={currentUser.email || ''} 
                  id="reg-email"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="reg-address">Full Shipping Address</label>
                <textarea 
                  required
                  rows={2}
                  id="reg-address"
                  placeholder="Street Address, City, State, ZIP"
                  value={joinForm.shippingAddress}
                  onChange={(e) => setJoinForm(prev => ({ ...prev, shippingAddress: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-xl text-sm focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="reg-phone">Contact Phone Number</label>
                <input 
                  type="tel" 
                  required
                  id="reg-phone"
                  placeholder="(+1) 555-0199"
                  value={joinForm.phone}
                  onChange={(e) => setJoinForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-xl text-sm focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading === 'join'}
                className="w-full py-3 bg-cyan-500 disabled:bg-cyan-500/40 text-slate-950 font-bold text-sm rounded-xl cursor-pointer hover:bg-cyan-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {actionLoading === 'join' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Retail Access Application
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : !isAdminUser && memberProfile && memberProfile.status === 'pending' ? (
        /* PENDING APPROVAL SCREEN */
        <div className="bg-[#0b1329] border border-cyan-500/25 rounded-2xl p-8 text-center flex flex-col items-center py-16" id="pending-waitlist-lobby">
          <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-full mb-4 animate-pulse">
            <Clock className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Account Application Pending</h2>
          <p className="text-slate-400 text-sm mt-3 max-w-sm leading-relaxed">
            Your laboratory access request under <span className="text-slate-200 font-semibold">{currentUser.email}</span> is currently queued in the pending registry.
          </p>
          <p className="text-xs text-slate-500 mt-4 leading-normal max-w-xs">
            Review cycles occur daily. The administrator will contact you at your registered email address or authorize your account directly on the dashboard shortly.
          </p>
        </div>
      ) : !isAdminUser && memberProfile && memberProfile.status === 'blocked' ? (
        /* ACCESS BLOCKED SCREEN */
        <div className="bg-[#0b1329] border border-red-500/20 rounded-2xl p-8 text-center flex flex-col items-center py-16" id="blocked-waitlist-lobby">
          <div className="p-4 bg-red-500/10 text-red-400 rounded-full mb-4">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Access Restricted</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md leading-relaxed">
            We regret to inform you that your retail partner access has been restricted by the administrator. Contact administrators for compliance or account resolution.
          </p>
        </div>
      ) : (
        /* FULL SHOPPING MODULE - VISIBLE TO APPROVED MEMBERS OR ADMINS */
        <div className="flex flex-col gap-6" id="active-shop-interface">
          
          {/* USER CATALOG VIEW */}
          {['catalog', 'admin_products'].includes(view) && (
            <div className="flex flex-col gap-6">
              
              {/* Consolidated Launch Sale & Per-vial pricing notice */}
              <div className="bg-gradient-to-r from-slate-950 via-[#0a0f1d] to-slate-950 border border-cyan-500/20 rounded-xl p-3 sm:p-4 text-left shadow-[0_0_15px_rgba(6,182,212,0.03)] focus-within:ring-1 focus-within:ring-cyan-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                  <h3 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Grand Opening Sale: <span className="text-cyan-400 bg-cyan-950/65 px-2 py-0.5 rounded border border-cyan-500/20 text-xs font-black">15% Off Site-Wide</span>
                  </h3>
                  <div className="text-[9px] uppercase font-black tracking-widest text-[#22d3ee] bg-cyan-950/45 px-2.5 py-0.5 rounded border border-cyan-500/20 self-start sm:self-center">
                    Automatic Checkout Discount
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Prices are auto-discounted to celebrate our application launch! Please note: <strong className="text-cyan-300 font-bold">every listed price represents exactly one (1) individual high-purity research vial (all vials are standard 3ml volume)</strong>, allowing you to build and customize your research volume as needed.
                </p>
              </div>

              {/* Norway & Switzerland Heritage Banner */}
              <div 
                onClick={() => { triggerHaptic('medium'); setShowNorwayModal(true); }}
                className="bg-gradient-to-r from-cyan-950/20 via-slate-900 to-indigo-950/20 border border-cyan-800/20 hover:border-cyan-400/40 rounded-xl p-3 sm:p-4 text-left cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.06)] group/norway-banner relative overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { triggerHaptic('medium'); setShowNorwayModal(true); } }}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 text-cyan-300 pointer-events-none transform translate-x-4 -translate-y-4 group-hover/norway-banner:scale-110 transition-transform duration-500">
                  <Sparkles className="w-24 h-24" />
                </div>
                
                {/* Visual border pulse highlight */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-500/10 via-sky-500/20 to-indigo-500/10 opacity-75 group-hover/norway-banner:from-cyan-400 group-hover/norway-banner:via-sky-400 group-hover/norway-banner:to-indigo-400 transition-all duration-300" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/20 flex items-center justify-center text-xl shrink-0 shadow-inner group-hover/norway-banner:scale-105 transition-transform duration-300 select-none">
                    🇳🇴
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[8px] uppercase font-black tracking-widest text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20 select-none">SCANDINAVIAN HERITAGE</span>
                      <span className="text-[8px] uppercase font-black tracking-widest text-[#a05eff] bg-[#1e0f35]/60 px-1.5 py-0.5 rounded border border-[#a05eff]/20 select-none">SWISS GMP</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                      Why are Norway-sourced peptides the best?
                      <span className="text-xs text-slate-500 group-hover:translate-x-1.5 transition-transform inline-block">→</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed max-w-2xl">
                      Since 1902, Northern Europe and Switzerland have led molecular synthesis. Learn how glacial baselines and micro-batch GMP controls outperform bulk industrial alternatives. <span className="text-cyan-400 font-bold group-hover:underline">Read the scientific facts.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Filtering and Search actions */}
              <div className="space-y-4">
                {/* Search Bar & Admin Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/80 p-3 sm:px-4 rounded-xl">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search high-purity chemical or peptide sequence..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowShopSuggestions(true);
                      }}
                      onFocus={() => setShowShopSuggestions(true)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-lg text-xs focus:outline-none focus:border-cyan-500 transition-all"
                    />

                    {/* Backdrop clickcatcher to dismiss list easily */}
                    {showShopSuggestions && searchQuery.trim().length > 0 && (
                      <div 
                        className="fixed inset-0 z-40 cursor-default" 
                        onClick={() => setShowShopSuggestions(false)} 
                      />
                    )}

                    {/* High-fidelity autocomplete popup dropdown */}
                    {showShopSuggestions && searchQuery.trim().length > 0 && (() => {
                      const shopSuggestions = products.filter(p =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase())
                      ).slice(0, 5);

                      return (
                        <div 
                          className="absolute top-full left-0 right-0 mt-2 bg-[#0b1329]/95 border border-cyan-500/45 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.85)] overflow-hidden z-50 divide-y divide-slate-800/80 backdrop-blur-md"
                          id="shop-suggestions-dropdown"
                        >
                          {shopSuggestions.length > 0 ? (
                            <div className="py-1">
                              <div className="px-3 py-1.5 text-[9px] font-bold text-cyan-400 uppercase tracking-widest bg-[#131e38]/70 flex justify-between items-center border-b border-slate-800/60">
                                <span>Suggested Products ({shopSuggestions.length})</span>
                                <span className="text-[8px] text-slate-500 font-normal">Tap to filter</span>
                              </div>
                              {shopSuggestions.map((prod) => (
                                <button
                                  key={prod.id}
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery(prod.name);
                                    setSelectedCategory('All');
                                    setShowShopSuggestions(false);
                                    setTimeout(() => {
                                      const anchor = document.getElementById('shop-viewport-anchor');
                                      if (anchor) {
                                        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      }
                                    }, 100);
                                  }}
                                  className="w-full text-left px-3 py-2.5 hover:bg-[#1e293b]/90 active:bg-slate-800/90 transition flex items-center justify-between gap-2 text-slate-200 cursor-pointer select-none border-0 group/shop-suggest"
                                >
                                  <div className="flex-1 min-w-0 text-left">
                                    <div className="font-bold text-[11px] text-white group-hover/shop-suggest:text-cyan-400 transition-colors truncate">
                                      {prod.name}
                                    </div>
                                    <div className="text-[9px] text-slate-400 truncate mt-0.5 max-w-[180px] sm:max-w-[200px]">
                                      {prod.description}
                                    </div>
                                  </div>
                                  <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono text-slate-400 shrink-0 select-none bg-slate-900 border border-slate-800 uppercase">
                                    {prod.category}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-3 py-3 text-[10px] text-slate-400 text-center flex flex-col items-center">
                              <span>No suggested items matching</span>
                              <span className="text-[9px] text-slate-500 font-mono italic">&ldquo;{searchQuery}&rdquo;</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {isViewingAsAdmin && (
                    <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => { triggerHaptic('light'); setEditingProduct(null); setProductValidationError(null); setProductForm({ name: '', description: '', category: '', price: 0, inventory: 50 }); setShowProductModal(true); }}
                        className="px-3.5 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" /> Add Product
                      </button>
                      <button
                        onClick={handleSeedDatabase}
                        disabled={actionLoading === 'seed'}
                        className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 hover:text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                        title="Overwrites or resets catalog with updated 99% pure certified stock titles"
                      >
                        {actionLoading === 'seed' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />} Reset Catalog
                      </button>
                    </div>
                  )}
                </div>

                {/* Advanced Category Visual Tabs Deck */}
                <div className="bg-[#0b1329]/40 border border-slate-850 p-3 sm:p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between px-1 select-none">
                    <span className="text-[9px] font-black tracking-widest text-[#22d3ee] uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" /> Sourcing Categories
                    </span>
                    {selectedCategory !== 'All' && (
                      <button 
                        onClick={() => { triggerHaptic('light'); setSelectedCategory('All'); }}
                        className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer hover:underline transition"
                      >
                        Clear Filter ({selectedCategory})
                      </button>
                    )}
                  </div>
                  
                  <div className="relative w-full overflow-hidden select-none">
                    {/* Left-right soft shadows representing fade on overflow scroll */}
                    <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10" />
                    
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 select-none scrollbar-none">
                      {categories.map(cat => {
                        const isActive = selectedCategory === cat;
                        const count = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
                        
                        // Icon mapping
                        let IconComponent = ShoppingBag;
                        let iconColor = 'text-cyan-400';
                        let activeBg = 'from-cyan-500/15 to-blue-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.12)]';
                        let iconBg = 'bg-cyan-950/75 border-cyan-500/20';
                        
                        if (cat === 'Muscle Growth') {
                          IconComponent = Flame;
                          iconColor = 'text-red-400';
                          activeBg = 'from-red-500/15 to-orange-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.12)]';
                          iconBg = 'bg-red-950/75 border-red-500/20';
                        } else if (cat === 'Weight Loss') {
                          IconComponent = TrendingUp;
                          iconColor = 'text-amber-400';
                          activeBg = 'from-amber-500/15 to-yellow-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.12)]';
                          iconBg = 'bg-amber-950/75 border-amber-500/20';
                        } else if (cat === 'Healing & Repair') {
                          IconComponent = Heart;
                          iconColor = 'text-emerald-400';
                          activeBg = 'from-emerald-500/15 to-teal-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.12)]';
                          iconBg = 'bg-emerald-950/75 border-emerald-500/20';
                        } else if (cat === 'Beauty & Radiance') {
                          IconComponent = Sparkles;
                          iconColor = 'text-pink-400';
                          activeBg = 'from-pink-500/15 to-fuchsia-500/10 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.12)]';
                          iconBg = 'bg-pink-950/75 border-pink-500/20';
                        } else if (cat === 'Cognitive & Focus') {
                          IconComponent = Brain;
                          iconColor = 'text-purple-400';
                          activeBg = 'from-purple-500/15 to-indigo-500/10 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.12)]';
                          iconBg = 'bg-purple-950/75 border-purple-500/20';
                        } else if (cat === 'Longevity & Cellular') {
                          IconComponent = Dna;
                          iconColor = 'text-teal-400';
                          activeBg = 'from-teal-500/15 to-emerald-500/10 border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.12)]';
                          iconBg = 'bg-teal-950/75 border-teal-500/20';
                        } else if (cat === 'Immune & Health') {
                          IconComponent = Shield;
                          iconColor = 'text-blue-400';
                          activeBg = 'from-blue-500/15 to-cyan-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.12)]';
                          iconBg = 'bg-blue-950/75 border-blue-500/20';
                        } else if (cat === 'Sleep & Recovery') {
                          IconComponent = Moon;
                          iconColor = 'text-violet-400';
                          activeBg = 'from-violet-500/15 to-fuchsia-500/10 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.12)]';
                          iconBg = 'bg-violet-950/75 border-violet-500/20';
                        } else if (cat === 'Reconstitution Solvents') {
                          IconComponent = Droplet;
                          iconColor = 'text-sky-400';
                          activeBg = 'from-sky-500/15 to-cyan-500/10 border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.12)]';
                          iconBg = 'bg-sky-950/75 border-sky-500/20';
                        }

                        return (
                          <button
                            key={cat}
                            onClick={() => { triggerHaptic('light'); setSelectedCategory(cat); }}
                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[11px] font-bold cursor-pointer whitespace-nowrap transition-all duration-300 border focus:outline-none select-none relative group/cat-btn ${
                              isActive 
                                ? `bg-gradient-to-br ${activeBg} text-white` 
                                : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                            }`}
                          >
                            {/* Accent bottom bar for the active tab */}
                            {isActive && (
                              <span className="absolute inset-x-4 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
                            )}

                            {/* Rounded Icon Ring */}
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${
                              isActive ? iconBg : 'bg-slate-900/40 border-slate-800/80 group-hover/cat-btn:border-slate-700'
                            }`}>
                              <IconComponent className={`w-3.5 h-3.5 ${isActive ? iconColor : 'text-slate-500 group-hover/cat-btn:text-slate-400'}`} />
                            </div>

                            {/* Label and Count Badge */}
                            <div className="flex items-center gap-2 font-sans overflow-hidden">
                              <span>{cat}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md leading-none border transition-colors ${
                                isActive 
                                  ? 'bg-slate-950/40 border-cyan-500/20 text-cyan-400 font-extrabold' 
                                  : 'bg-slate-900 border-slate-800 text-slate-500'
                              }`}>
                                {count}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCTS LISTING */}
              {catalogLoading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-[#0f172a]/20 border border-[#1e293b]/50 rounded-2xl">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                  <p className="text-slate-400 text-xs text-center">Loading authorized substance inventory...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-[#0b1329] border border-slate-800 rounded-2xl py-12 p-6 text-center">
                  <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No biochemical products available</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                    {isViewingAsAdmin ? 'Add new products above or seed the database catalog to start.' : 'There are currently no products under the selected categories.'}
                  </p>
                </div>
              ) : (
                (() => {
                  const groupedDisplayItems: {
                    baseName: string;
                    category: string;
                    options: (ShopProduct & { size: string })[];
                  }[] = [];

                  filteredProducts.forEach(prod => {
                    const { baseName, size } = getProductBaseAndSize(prod.name);
                    let group = groupedDisplayItems.find(g => g.baseName === baseName);
                    if (!group) {
                      group = {
                        baseName,
                        category: prod.category,
                        options: []
                      };
                      groupedDisplayItems.push(group);
                    }
                    group.options.push({ ...prod, size });
                  });

                  // Sort options (smallest/cheapest size first)
                  groupedDisplayItems.forEach(group => {
                    group.options.sort((a, b) => {
                      const numA = parseFloat(a.size) || 0;
                      const numB = parseFloat(b.size) || 0;
                      if (numA !== numB) return numA - numB;
                      return a.price - b.price;
                    });
                  });

                  // Sort groups to put in-stock products at the top always, with alphabetical sub-sort
                  groupedDisplayItems.sort((a, b) => {
                    const stockA = a.options.reduce((sum, o) => sum + getProductAvailableStock(o.id, o.inventory), 0);
                    const stockB = b.options.reduce((sum, o) => sum + getProductAvailableStock(o.id, o.inventory), 0);
                    const hasStockA = stockA > 0 ? 1 : 0;
                    const hasStockB = stockB > 0 ? 1 : 0;
                    if (hasStockA !== hasStockB) {
                      return hasStockB - hasStockA; // In-stock comes first
                    }
                    return a.baseName.localeCompare(b.baseName);
                  });

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedDisplayItems.map(group => {
                        const prices = group.options.map(o => o.price);
                        const minPrice = Math.min(...prices);
                        const maxPrice = Math.max(...prices);
                        const totalStock = group.options.reduce((sum, o) => sum + getProductAvailableStock(o.id, o.inventory), 0);
                        const hasStock = totalStock > 0;
                        const firstOption = group.options[0];
                        const inStockOption = group.options.find(o => getProductAvailableStock(o.id, o.inventory) > 0);
                        const preferredDefault = inStockOption || firstOption;
                        const activeProdId = selectedProductIds[group.baseName] || preferredDefault?.id;

                        return (
                          <div
                            key={group.baseName}
                            className="bg-[#0b1329] border border-[#1e293b] hover:border-cyan-500/30 rounded-2xl flex flex-col justify-between hover:shadow-[0_0_20px_rgba(6,182,212,0.04)] transition-all overflow-hidden group text-left"
                          >
                            {/* Tap image to open drawer */}
                            <div 
                              onClick={() => {
                                triggerHaptic('light');
                                setSelectedParentProductGroup({
                                  baseName: group.baseName,
                                  category: group.category,
                                  description: firstOption?.description || '',
                                  options: group.options
                                });
                                setSelectedOptionIdInDrawer(activeProdId || firstOption?.id || '');
                                setDrawerQuantity(1);
                              }}
                              className="cursor-pointer hover:opacity-95 transition-opacity"
                            >
                              <ProductVialVisual name={group.baseName} category={group.category} theme={labratTheme} />
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                              {/* Tap text to open drawer */}
                              <div
                                onClick={() => {
                                  triggerHaptic('light');
                                  setSelectedParentProductGroup({
                                    baseName: group.baseName,
                                    category: group.category,
                                    description: firstOption?.description || '',
                                    options: group.options
                                  });
                                  setSelectedOptionIdInDrawer(activeProdId || firstOption?.id || '');
                                  setDrawerQuantity(1);
                                }}
                                className="cursor-pointer hover:opacity-95 transition-opacity"
                              >
                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                  <span className="px-2 py-0.5 rounded bg-[#1e293b] text-slate-300 text-[10px] font-bold tracking-wider uppercase">
                                    {group.category}
                                  </span>
                                  {(() => {
                                    const benefit = getSecondaryBenefit(group.baseName, group.category);
                                    return (
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${getSecondaryBenefitStyle(benefit)}`}>
                                        {benefit}
                                      </span>
                                    );
                                  })()}
                                  <span className="text-[11px] ml-auto">
                                    {(() => {
                                      const activeOpt = group.options.find(o => o.id === activeProdId) || firstOption;
                                      const activeOptStock = activeOpt ? getProductAvailableStock(activeOpt.id, activeOpt.inventory) : 0;
                                      return activeOptStock > 0 ? (
                                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> {activeOptStock} vials in stock
                                        </span>
                                      ) : (
                                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Manufacturing Phase
                                        </span>
                                      );
                                    })()}
                                  </span>
                                </div>

                                <h4 className="text-base font-extrabold text-slate-100 tracking-tight group-hover:text-cyan-400 transition-colors">
                                  {group.baseName}
                                </h4>

                                <p className="text-xs text-slate-400 mt-2 leading-normal min-h-[54px] line-clamp-3">
                                  {getCleanDescription(firstOption?.description)}
                                </p>
                              </div>

                              <div className="border-t border-slate-800/50 pt-3 mt-1">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Available Strengths:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {group.options.map(opt => {
                                    const isSelected = activeProdId === opt.id;
                                    const optStock = getProductAvailableStock(opt.id, opt.inventory);
                                    const isInStock = optStock > 0;
                                    return (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Avoid triggering details drawer
                                          triggerHaptic('light');
                                          setSelectedProductIds(prev => ({
                                            ...prev,
                                            [group.baseName]: opt.id
                                          }));
                                        }}
                                        className={`px-2.5 py-1.5 transition-all duration-100 font-mono text-[10.5px] font-bold rounded uppercase tracking-wider block shadow-sm cursor-pointer hover:scale-[1.05] active:scale-[0.95] border ${
                                          isSelected
                                            ? isInStock
                                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                              : 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                                            : isInStock
                                              ? 'bg-slate-950 text-emerald-400 border-emerald-950/40 hover:bg-emerald-950/20 hover:border-emerald-500/30'
                                              : 'bg-slate-950 text-amber-400 border-amber-950/40 hover:bg-amber-950/20 hover:border-amber-500/30'
                                        }`}
                                      >
                                        {opt.size || '10mg'}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {(() => {
                              const activeProduct = group.options.find(o => o.id === activeProdId) || firstOption;
                              if (!activeProduct) return null;
                              const isOutOfStock = getProductAvailableStock(activeProduct.id, activeProduct.inventory) <= 0;

                              return (
                                <div className="bg-slate-950 border-t border-[#1e293b]/70 p-4 flex items-center justify-between gap-4">
                                  <div className="flex flex-col text-left flex-1 min-w-0 pr-1">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate block">
                                      Research Price ({getProductBaseAndSize(activeProduct.name).size || 'each'})
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs text-slate-500 line-through">
                                        ${activeProduct.price}.00
                                      </span>
                                      <span className="text-sm font-black text-cyan-400">
                                        ${getSalePrice(activeProduct.price)}.00
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={isOutOfStock}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isOutOfStock) return;
                                      triggerHaptic('medium');
                                      handleAddToCart(activeProduct);
                                    }}
                                    className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all active:scale-[0.97] cursor-pointer shrink-0 whitespace-nowrap ${
                                      isOutOfStock
                                        ? 'bg-slate-850 text-slate-500 border border-slate-800/40 cursor-not-allowed'
                                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                                    }`}
                                  >
                                    {isOutOfStock ? 'Manufacturing Phase' : 'Add to Cart'} <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* USER SHOPPING CART VIEW */}
          {view === 'cart' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CART ITEMS LIST */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-cyan-400" /> Vials &amp; Materials Selected ({cart.length})
                  </h2>
                  <button 
                    onClick={() => { triggerHaptic('light'); setView('catalog'); }}
                    className="text-xs text-cyan-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="bg-[#0b1329] border border-slate-800 rounded-2xl py-12 p-6 text-center">
                    <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white">Your Shopping Cart is Empty</h3>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                      Explore the materials catalog to reserve biochemical compounds.
                    </p>
                    <button
                      onClick={() => { triggerHaptic('light'); setView('catalog'); }}
                      className="mt-4 px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#10172a]/40 border border-[#1e293b]/80 rounded-2xl divide-y divide-[#1e293b]/50">
                    {cart.map(item => (
                      <div key={item.product.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="max-w-xs text-left">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.product.category}</span>
                          <h4 className="text-sm font-bold text-white tracking-tight mt-0.5">{item.product.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1 sm:mt-0.5 flex-wrap">
                            <span className="text-[10px] text-slate-500 line-through">${item.product.price}.00</span>
                            <span className="text-xs text-cyan-400 font-semibold inline-block mt-0.5">${getSalePrice(item.product.price)}.00 per vial</span>
                            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                              {item.product.category === 'Reconstitution Solvents' ? '30ml Volume' : '3ml Volume'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                          {/* Quantities Adjustment Controls */}
                          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => handleAdjustQuantity(item.product.id, -1)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-extrabold text-slate-200">{item.quantity}</span>
                            <button
                              onClick={() => handleAdjustQuantity(item.product.id, 1)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-sm font-extrabold text-white w-16 text-right">
                              ${getSalePrice(item.product.price) * item.quantity}.00
                            </span>
                            <button
                              onClick={() => handleRemoveFromCart(item.product.id)}
                              className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-all cursor-pointer"
                              title="Discard compound"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CHECKOUT PRICING SUMMARY */}
              <div className="lg:col-span-1">
                {cart.length > 0 && (() => {
                  const nonBacItems = cart.filter(item => item.product.id !== 'prod_bac_water_30ml');
                  const nonBacSubtotal = nonBacItems.reduce((sum, item) => sum + (getSalePrice(item.product.price) * item.quantity), 0);
                  const isFreeShippingEligible = nonBacSubtotal >= 100;
                  const isFlorida = shippingForm.state.trim().toLowerCase() === 'fl' || shippingForm.state.trim().toLowerCase() === 'florida';
                  const salesTaxRate = 0.06;
                  const salesTax = isFlorida ? Math.round(subtotal * salesTaxRate * 100) / 100 : 0;

                  return (
                    <div className="space-y-4 sticky top-6 text-left">
                      {/* Free Shipping Progress Card */}
                      <div className="bg-[#0b1329] border border-[#1e293b] p-5 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-300">Free Shipping Progress</span>
                          {isFreeShippingEligible ? (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse border border-emerald-500/10">Unlocked</span>
                          ) : (
                            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-cyan-500/10">In Progress</span>
                          )}
                        </div>
                        
                        <p className="text-[11px] text-slate-400 leading-normal mb-4">
                          Spend <span className="text-cyan-400 font-semibold">$100.00</span> or more in eligible compounds to unlock <span className="text-emerald-400 font-semibold">FREE ground delivery</span>!
                        </p>

                        <div className="space-y-3">
                          {/* Price Progress */}
                          <div>
                            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                              <span>Eligible Subtotal: ${nonBacSubtotal} / $100</span>
                              <span className={isFreeShippingEligible ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{Math.min(100, Math.round((nonBacSubtotal / 100) * 100))}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${isFreeShippingEligible ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-cyan-500'}`}
                                style={{ width: `${Math.min(100, (nonBacSubtotal / 100) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0b1329] border border-[#1e293b] p-6 rounded-2xl">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#1e293b]">
                          Order Summary
                        </h3>
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>Physical Vials ({totalQty})</span>
                            <span className="font-semibold text-slate-200">${subtotal}.00</span>
                          </div>
                          {isFlorida ? (
                            <div className="flex justify-between text-slate-400">
                              <span>Florida Sales Tax (6.0%)</span>
                              <span className="font-semibold text-slate-200">${salesTax.toFixed(2)}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between text-slate-400">
                              <span>Estimated Sales Tax</span>
                              <span className="font-semibold text-slate-500">$0.00</span>
                            </div>
                          )}
                          <div className="h-px bg-[#1e293b] my-4" />
                          <div className="flex justify-between text-sm">
                            <span className="font-bold text-white">{isFlorida ? 'Estimated Total' : 'Estimated Subtotal'}</span>
                            <span className="font-black text-cyan-400 text-lg">${(subtotal + salesTax).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-cyan-400/90 rounded-xl p-3.5 mt-5 leading-normal">
                          🤝 <span className="font-bold text-cyan-300">No Payment Details Required:</span> Checkout is completed without providing banking or debit information. The administrator handles invoicing manually by verified email.
                        </div>

                        <button
                          onClick={() => { triggerHaptic('light'); setView('checkout'); }}
                          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase mt-5 active:scale-[0.98] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          Go to Delivery Options <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* USER CHECKOUT SUBMISSION VIEW */}
          {view === 'checkout' && (() => {
            const totalVials = cart.reduce((sum, item) => sum + item.quantity, 0);
            
            // Check if shipping address details have been fully entered
            const isAddressProvided = !!(
              shippingForm.fullName.trim() &&
              shippingForm.addressLine1.trim() &&
              shippingForm.city.trim() &&
              shippingForm.state.trim() &&
              shippingForm.zipCode.trim().length >= 5
            );

            const shippingDetails = getShippingOptions(shippingForm.zipCode, totalVials, cart);
            const selectedOption = isAddressProvided
              ? (shippingDetails.options.find(o => o.id === selectedShippingOptionId) || shippingDetails.options[0])
              : null;
            const shippingCost = selectedOption ? selectedOption.cost : 0;
            const isFlorida = shippingForm.state.trim().toLowerCase() === 'fl' || shippingForm.state.trim().toLowerCase() === 'florida';
            const salesTaxRate = 0.06;
            const salesTax = isFlorida ? Math.round(subtotal * salesTaxRate * 100) / 100 : 0;
            const finalInvoiceTotal = subtotal + shippingCost + salesTax;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* DELIVERY DATA INPUTS */}
                <div className="lg:col-span-2">
                  <div className="bg-[#0b1329]/70 border border-[#1e293b] p-6 sm:p-8 rounded-2xl">
                    <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-cyan-400" /> Laboratory Delivery Dispatch Address
                    </h3>
                    
                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-name">Full Dispatch Name</label>
                        <input 
                          type="text" 
                          required
                          id="ship-name"
                          autoComplete="name"
                          placeholder="John Thompson"
                          value={shippingForm.fullName}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-address">Shipping Address</label>
                          <input 
                            type="text" 
                            required
                            id="ship-address"
                            autoComplete="street-address"
                            placeholder="Terminal Wharf Road, Building #1A"
                            value={shippingForm.addressLine1}
                            onChange={(e) => setShippingForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-city">City</label>
                          <input 
                            type="text" 
                            required
                            id="ship-city"
                            autoComplete="address-level2"
                            placeholder="Boston"
                            value={shippingForm.city}
                            onChange={(e) => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-state">State / Province</label>
                          <input 
                            type="text" 
                            required
                            id="ship-state"
                            autoComplete="address-level1"
                            placeholder="MA"
                            value={shippingForm.state}
                            onChange={(e) => setShippingForm(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-zip">Zip / Postal Code</label>
                          <input 
                            type="text" 
                            required
                            id="ship-zip"
                            autoComplete="postal-code"
                            placeholder="34609"
                            value={shippingForm.zipCode}
                            onChange={(e) => setShippingForm(prev => ({ ...prev, zipCode: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-phone">Contact Phone</label>
                          <input 
                            type="tel" 
                            required
                            id="ship-phone"
                            autoComplete="tel"
                            placeholder="(+1) 555-0104"
                            value={shippingForm.phone}
                            onChange={(e) => setShippingForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 rounded-xl text-xs transition-all focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* DISPATCH ORIGIN HIGHLIGHT WIDGET */}
                      <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-950 text-cyan-400 rounded-lg border border-slate-800">
                            <Truck className="w-5 h-5 text-cyan-400 animate-pulse" />
                          </div>
                          <div className="text-left font-sans">
                            <span className="text-[9px] uppercase font-black text-slate-500 font-mono tracking-widest block">Dispatch Hub Origin</span>
                            <span className="font-extrabold text-slate-200">Greater Tampa Bay</span>
                          </div>
                        </div>
                        <span className="text-[9.5px] font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/15 px-2.5 py-1 rounded-md font-mono select-none uppercase tracking-wide shrink-0">
                          📍 USA Shipping Facility
                        </span>
                      </div>

                      {/* POSTAGE CARRIER & SHIPPING SERVICE SELECTOR */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 my-4 text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3 mb-3">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block font-mono">POSTAGE & IN-TRANSIT RATES</span>
                            <h4 className="text-xs font-black text-slate-200 mt-0.5 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-cyan-400" /> Carrier Dispatch Estimates
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                              📦 Weight: <b className="text-slate-300 font-bold">{shippingDetails.weightLbs} lbs</b>
                            </span>
                            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                              📍 {isAddressProvided ? shippingDetails.zoneName : 'Pending Address'}
                            </span>
                          </div>
                        </div>

                        {isAddressProvided ? (
                          <>
                            {/* Carrier Filters */}
                            <div className="flex gap-2 mb-4">
                              {(['ALL', 'USPS', 'UPS'] as const).map(carrier => (
                                <button
                                  key={carrier}
                                  type="button"
                                  onClick={() => { triggerHaptic('light'); setShippingCarrierFilter(carrier); }}
                                  className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                                    shippingCarrierFilter === carrier
                                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
                                  }`}
                                >
                                  {carrier === 'ALL' ? 'All Services' : carrier}
                                </button>
                              ))}
                            </div>

                            {/* Options List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                              {shippingDetails.options
                                .filter(opt => shippingCarrierFilter === 'ALL' || opt.carrier === shippingCarrierFilter)
                                .map(opt => {
                                  const isSelected = selectedShippingOptionId === opt.id;
                                  return (
                                    <div
                                      key={opt.id}
                                      onClick={() => { triggerHaptic('light'); setSelectedShippingOptionId(opt.id); }}
                                      className={`border rounded-xl p-3 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group select-none min-h-[92px] ${
                                        isSelected
                                          ? 'bg-cyan-950/25 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.06)]'
                                          : 'bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-1.5">
                                        <div className="flex items-center gap-1.5">
                                          <span className={`text-[8px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded ${
                                            opt.carrier === 'USPS'
                                              ? 'bg-blue-600/20 text-blue-400'
                                              : 'bg-amber-600/20 text-amber-500'
                                          }`}>
                                            {opt.carrier}
                                          </span>
                                          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                                            {opt.name.replace('USPS ', '').replace('UPS® ', '')}
                                          </span>
                                        </div>
                                        <span className={`text-xs font-black font-mono select-all ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                                          ${opt.cost.toFixed(2)}
                                        </span>
                                      </div>

                                      <div className="flex items-end justify-between mt-3 text-[10px] font-mono">
                                        <div className="space-y-0.5">
                                          <div className="text-slate-500 text-[9.5px]">Est: {opt.transitDaysMin === opt.transitDaysMax ? `${opt.transitDaysMin} Business Day` : `${opt.transitDaysMin}-${opt.transitDaysMax} Business Days`}</div>
                                          <div className="text-cyan-400/85">📅 {opt.estimatedDeliveryDate}</div>
                                        </div>
                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                          isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-slate-700'
                                        }`}>
                                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </>
                        ) : (
                          <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                            <MapPin className="w-7 h-7 text-slate-600" />
                            <div className="space-y-1 max-w-sm">
                              <p className="font-bold text-slate-300">Awaiting Dispatch Address Details</p>
                              <p className="text-[10.5px] text-slate-500 leading-normal">
                                Enter your full dispatch name, street address, city, state, and complete 5-digit ZIP code above to calculate shipping options instantly.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5" htmlFor="ship-notes">Special Dispatch / Delivery Instructions</label>
                        <textarea 
                          rows={2}
                          id="ship-notes"
                          placeholder="Leave at front porch, keep upright, or special requests..."
                          value={shippingForm.notes}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-xl text-xs transition-all focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => { triggerHaptic('light'); setView('cart'); }}
                          className="px-5 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Adjust Cart
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading === 'checkout'}
                          className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 text-slate-950 font-black text-xs rounded-xl uppercase transition-all tracking-wider active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                        >
                          {actionLoading === 'checkout' ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Dispatching Request...
                            </>
                          ) : (
                            <>
                              Confirm Dispatch Order &amp; Invoice Request <Send className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* MINI CART SUMMARY */}
                <div className="lg:col-span-1">
                  <div className="bg-[#0b1329] border border-slate-800 p-5 rounded-2xl sticky top-4">
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-3">Vials Reserved</h3>
                    <div className="divide-y divide-[#1e293b]/50 max-h-[160px] overflow-y-auto mb-4 scrollbar-none pr-1">
                      {cart.map(item => (
                        <div key={item.product.id} className="py-2.5 flex justify-between text-xs text-left">
                          <div className="text-slate-400">
                            <span className="font-extrabold text-[#22d3ee] mr-1">{item.quantity}x</span>
                            {item.product.name}
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[10px] text-slate-600 line-through">${item.product.price * item.quantity}</span>
                            <span className="font-bold text-slate-200">${getSalePrice(item.product.price) * item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-slate-800 my-3" />

                    {/* Detailed Invoice Breakdown */}
                    <div className="space-y-2 text-xs border-b border-slate-800/60 pb-3 mb-3">
                      <div className="flex justify-between items-center text-slate-400 leading-none">
                        <span>Research Subtotal:</span>
                        <span className="font-semibold text-slate-300 font-mono">${subtotal}.00</span>
                      </div>
                      <div className="flex justify-between items-start text-slate-400 leading-none">
                        <div className="text-left">
                          <span>Postage Dispatch:</span>
                          <span className="block text-[9.5px] text-slate-500 font-mono">
                            {selectedOption ? `${selectedOption.carrier} ${selectedOption.name.replace('USPS ', '').replace('UPS® ', '')}` : 'Pending Address'}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-300 font-mono">
                          {selectedOption ? `+$${shippingCost.toFixed(2)}` : '--'}
                        </span>
                      </div>
                      {isFlorida && (
                        <div className="flex justify-between items-center text-slate-400 leading-none">
                          <span className="flex items-center gap-1">Florida Sales Tax (6.0%):</span>
                          <span className="font-semibold text-emerald-400 font-mono">
                            +${salesTax.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200 uppercase tracking-wide">Invoice Total:</span>
                      <span className="text-lg font-black text-cyan-400 font-mono">${finalInvoiceTotal.toFixed(2)}</span>
                    </div>

                    <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5 text-[10px] text-emerald-300/90 leading-tight flex items-start gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><b>Manual Transfer:</b> Invoicing totals arrive via email inclusive of your chosen carrier postage.</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* USER ORDERS HISTORY LIST VIEW */}
          {view === 'orders' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-cyan-400" /> My Physical Dispatch Requests
              </h2>
              
              {ordersLoading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-[#0f172a]/25 border border-[#1e293b]/70 rounded-2xl">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                  <p className="text-slate-400 text-xs">Loading order dispatch lists...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-[#0b1329] border border-slate-800 rounded-2xl py-12 p-6 text-center">
                  <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No active orders placed</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                    You have not submitted any dispatch or compound shipping requests yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-[#0b1329] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-6 transition-all">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                          <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded">
                            {order.id}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                            order.status === 'placed' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/15' :
                            order.status === 'processing' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/15' :
                            order.status === 'shipped' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/15' :
                            order.status === 'completed' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/15' :
                            'bg-red-500/15 text-red-300 border border-red-500/15'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>

                        {/* List products inside the order */}
                        <div className="mt-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800 border-dashed space-y-1 w-full max-w-md">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-slate-300">
                              <span>
                                <span className="font-bold text-[#22d3ee] mr-1.5">{item.quantity}x</span>
                                {item.name}
                              </span>
                              <span className="font-semibold text-slate-400">${item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>Dispatch Address: <b className="text-slate-300 font-semibold">{order.shippingInfo.fullName}</b>, {order.shippingInfo.addressLine1}, {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</span>
                        </div>

                        {order.shippingInfo.carrier && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5 font-mono">
                            <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>
                              Postage: <b className="text-slate-200 font-semibold">{order.shippingInfo.carrier} {order.shippingInfo.method}</b> (Estimate: <b className="text-cyan-400">{order.shippingInfo.deliveryEstimate}</b>)
                            </span>
                          </div>
                        )}

                        {order.trackingNumber && (
                          <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl max-w-md">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                              <div className="flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
                                <span className="text-xs text-slate-300 font-semibold font-mono">
                                  USPS Tracking: <span className="text-cyan-300 font-bold ml-1">{order.trackingNumber}</span>
                                </span>
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                order.trackingStatus === 'delivered' || order.status === 'completed'
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' 
                                  : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                              }`}>
                                {order.trackingStatus === 'delivered' || order.status === 'completed' ? 'Delivered' : 'In Transit'}
                              </span>
                            </div>

                            {/* Horizontal Progress Stepper */}
                            <div className="grid grid-cols-4 gap-1 relative py-1 mb-2">
                              <div className="absolute top-1/2 left-2 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                              {[
                                { label: 'Paid', active: order.paymentStatus === 'paid' || ['processing', 'shipped', 'completed'].includes(order.status) },
                                { label: 'Processed', active: ['processing', 'shipped', 'completed'].includes(order.status) },
                                { label: 'Shipped', active: ['shipped', 'completed'].includes(order.status) },
                                { label: 'Delivered', active: order.status === 'completed' }
                              ].map((step, idx) => (
                                <div key={idx} className="flex flex-col items-center relative z-10">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                                    step.active 
                                      ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]' 
                                      : 'bg-slate-950 border-slate-800 text-slate-400'
                                  }`}>
                                    {step.active ? '✓' : idx + 1}
                                  </div>
                                  <span className={`text-[8px] font-bold mt-1 text-center whitespace-nowrap ${
                                    step.active ? 'text-white' : 'text-slate-500'
                                  }`}>{step.label}</span>
                                </div>
                              ))}
                            </div>

                            {/* Auto Delivery Check simulation */}
                            {order.status === 'shipped' && (
                              <div className="mt-3.5 flex justify-end">
                                <button
                                  onClick={() => handleSimulateDeliveryCheck(order.id)}
                                  disabled={actionLoading === `check_${order.id}`}
                                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] rounded-lg tracking-wide hover:text-white transition-all cursor-pointer flex items-center gap-1.5 animate-pulse"
                                >
                                  {actionLoading === `check_${order.id}` ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin text-cyan-400" /> Connecting USPS...
                                    </>
                                  ) : (
                                    <>
                                      <Truck className="w-3.5 h-3.5" /> Check Delivery Status
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-between items-start md:items-end md:text-right border-t md:border-t-0 border-[#1e293b]/50 pt-4 md:pt-0 shrink-0 text-xs gap-3">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {order.paymentStatus === 'paid' ? 'Paid & Verified' : 'Awaiting Email Invoice'}
                          </span>
                          <div className="text-xl font-black text-white mt-0.5">${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</div>
                          
                          <div className="mt-1 flex items-center justify-end gap-1.5">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                              order.paymentStatus === 'paid' 
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            }`}>
                              {order.paymentStatus === 'paid' ? '💳 PAID' : '⏳ UNPAID'}
                            </span>
                          </div>
                        </div>

                        {order.paymentStatus !== 'paid' ? (
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 max-w-xs">
                            ✉️ <span className="text-slate-300 font-semibold">Invoicing Note:</span> A payment guide matching this total has been queued. Look for an email from the administrator at <b className="text-cyan-400">{currentUser?.email}</b> shortly.
                          </div>
                        ) : (
                          <div className="bg-emerald-950/10 p-2.5 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-400 max-w-xs">
                            ✓ <span className="text-emerald-300 font-semibold">Payment Received:</span> Your sterile research compounds have been placed in processing.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {/* ======================================= */}
          {/* ADMINISTRATOR CONSOLE VIEWS (STRICT ACCESS) */}
          {/* ======================================= */}

          {isAdminUser && view === 'admin_members' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-red-300 flex flex-wrap items-center gap-1.5">
                  <Users className="w-5 h-5" /> Vetting &amp; Members Approval Portal
                  {pendingApprovalCount > 0 && (
                    <span className="ml-1 rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-red-200">
                      {pendingApprovalCount} pending
                    </span>
                  )}
                </h2>
                <div className="text-xs text-slate-400">
                  Logged in as Administrator
                </div>
              </div>

              {membersLoading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-[#0f172a]/20 border border-[#1e293b]/50 rounded-2xl">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                  <p className="text-slate-400 text-xs">Fetching registered accounts...</p>
                </div>
              ) : adminMembersList.length === 0 ? (
                <div className="bg-[#0b1329] border border-slate-800 rounded-2xl py-12 p-6 text-center">
                  <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No pending requests</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                    There are currently no users registered in the members table.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
                  {adminMembersList.map(member => (
                    <div key={member.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-slate-900/40">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-sm font-bold text-white">{member.displayName}</h4>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                            member.status === 'approved' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                            member.status === 'blocked' ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
                            'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}>
                            {member.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" /> {member.email}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {member.shippingAddress}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" /> {member.phone}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 self-end md:self-center shrink-0">
                        {member.status !== 'approved' && (
                          <button
                            onClick={() => handleSetMemberStatus(member.id, 'approved')}
                            disabled={actionLoading !== null}
                            className="px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {member.status !== 'blocked' && (
                          <button
                            onClick={() => handleSetMemberStatus(member.id, 'blocked')}
                            disabled={actionLoading !== null}
                            className="px-3 py-1.5 bg-[#10172a] hover:bg-red-500/10 hover:text-red-300 text-slate-400 text-xs font-bold rounded-lg cursor-pointer border border-slate-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Restrict
                          </button>
                        )}
                        {member.status !== 'pending' && (
                          <button
                            onClick={() => handleSetMemberStatus(member.id, 'pending')}
                            disabled={actionLoading !== null}
                            className="px-2 py-1.5 bg-slate-900 text-slate-400 text-xs hover:text-white rounded-lg cursor-pointer border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reset
                          </button>
                        )}
                        {confirmDeleteMemberId === member.id ? (
                          <div className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 p-1">
                            <button
                              onClick={() => handleDeleteMemberProfile(member.id)}
                              disabled={actionLoading !== null}
                              className="px-2 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-wide rounded-md cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === `member_${member.id}_delete` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteMemberId(null)}
                              disabled={actionLoading !== null}
                              className="px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteMemberId(member.id)}
                            disabled={actionLoading !== null}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold rounded-lg cursor-pointer border border-red-500/25 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAdminUser && view === 'admin_orders' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-4 mb-2">
                <div>
                  <h2 className="text-lg font-bold text-red-300 flex flex-wrap items-center gap-1.5">
                    <ClipboardList className="w-5 h-5 text-red-500 animate-pulse" /> Master Retail Partner Orders Console
                    {newOrderCount > 0 && (
                      <span className="ml-1 rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-200">
                        {newOrderCount} new
                      </span>
                    )}
                  </h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Verify physical payments, dispatch compounds, and manage cold-chain tracking.
                  </div>
                </div>
                <button
                  onClick={handleSeedDemoOrder}
                  disabled={actionLoading === 'seed_order'}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-500 text-slate-950 hover:from-red-500 hover:to-amber-400 text-xs font-black rounded-xl uppercase tracking-wider shadow-[0_4px_12px_rgba(239,68,68,0.2)] disabled:opacity-50 cursor-pointer flex items-center gap-2 self-start sm:self-center transition-all hover:scale-[1.02]"
                >
                  {actionLoading === 'seed_order' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Seeding Order...
                    </>
                  ) : (
                    <>
                      🚀 Send Sample Order to KyleHeiser@gmail.com
                    </>
                  )}
                </button>
              </div>

              {ordersLoading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-[#0f172a]/20 border border-[#1e293b]/50 rounded-2xl">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                  <p className="text-slate-400 text-xs">Loading all orders...</p>
                </div>
              ) : adminOrdersList.length === 0 ? (
                <div className="bg-[#0b1329] border border-slate-800 rounded-2xl py-12 p-6 text-center">
                  <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No orders placed on the network</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                    Retail accounts have not requested compound dispatch yet or click "Send Sample Order" above to seed a demo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminOrdersList.map(order => (
                    <div key={order.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-6 transition-all">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-mono font-semibold text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded border border-[#ef4444]/25">
                            {order.id}
                          </span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                            order.status === 'placed' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                            order.status === 'processing' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                            order.status === 'shipped' ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/20' :
                            order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                            'bg-red-500/10 text-red-300 border border-red-500/20'
                          }`}>
                            {order.status}
                          </span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
                          }`}>
                            {order.paymentStatus === 'paid' ? '💳 PAID' : '⏳ UNPAID'}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Placed: {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Customer overview */}
                        <div className="text-xs text-slate-300 space-y-1">
                          <p>👤 Buyer: <b className="text-white">{order.displayName}</b> ({order.email})</p>
                          <p>📍 Address: {order.shippingInfo.fullName}, {order.shippingInfo.addressLine1}, {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</p>
                          <p>📞 Phone: {order.shippingInfo.phone}</p>
                          {order.shippingInfo.notes && (
                            <p className="italic text-slate-500 mt-1">📝 Notes: "{order.shippingInfo.notes}"</p>
                          )}
                        </div>

                        {/* Items list */}
                        <div className="mt-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 max-w-lg">
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Ordered Compounds Detail</div>
                          {order.items.map((item, idx) => {
                            const costPerVial = getProductCostPerVial(item.name, item.price / 0.85);
                            const itemProfit = item.price - costPerVial;
                            const totalProfitForLine = itemProfit * item.quantity;
                            return (
                              <div key={idx} className="flex flex-col border-b border-slate-800/30 pb-1.5 last:border-0 last:pb-0">
                                <div className="flex justify-between text-xs font-mono text-slate-300">
                                  <span>
                                    <span className="font-bold text-[#ef4444] mr-2">{item.quantity}x</span>
                                    {item.name}
                                  </span>
                                  <span className="text-slate-400 font-semibold">${item.price * item.quantity}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                                  <span>Cost per Vial: ${costPerVial.toFixed(2)}</span>
                                  <span>Line Profit: <span className="text-emerald-400/90 font-semibold">${totalProfitForLine.toFixed(2)}</span></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Tracking Input interface for Admin */}
                        {order.status === 'processing' && (
                          <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor={`track_input_${order.id}`}>Fulfillment Carrier Tracking</label>
                            <div className="flex gap-1.5 mt-1">
                              <input 
                                type="text" 
                                placeholder="e.g. USPS9400100..." 
                                id={`track_input_${order.id}`}
                                defaultValue={order.trackingNumber || ''}
                                className="bg-slate-950 px-2 py-1 text-xs text-white border border-slate-800 rounded focus:border-cyan-500 focus:outline-none flex-1 font-mono"
                              />
                              <button
                                onClick={() => {
                                  const input = document.getElementById(`track_input_${order.id}`) as HTMLInputElement;
                                  const val = input?.value?.trim() || 'USPS94001' + Math.floor(100000 + Math.random() * 900000);
                                  handleShipOrder(order.id, val);
                                }}
                                disabled={actionLoading !== null}
                                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded cursor-pointer"
                              >
                                Ship &amp; Notify
                              </button>
                            </div>
                          </div>
                        )}

                        {order.trackingNumber && (
                          <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm text-xs space-y-1 ml-0.5">
                            <p className="font-mono text-[10px] text-slate-400">📦 Tracking: <span className="text-cyan-400 font-bold">{order.trackingNumber}</span></p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              Tracking Status: 
                              <span className={`font-extrabold uppercase px-1.5 py-0.5 rounded text-[8px] ${order.trackingStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'}`}>
                                {order.trackingStatus || 'shipped'}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Control transitions & Email Actions */}
                      <div className="flex flex-col justify-between items-start md:items-end shrink-0 select-none">
                        <div className="md:text-right">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bill Total</span>
                          <div className="text-2xl font-black text-rose-300 mt-0.5">
                            ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                          </div>
                          {(() => {
                            const shippingCost = order.shippingInfo?.cost || 0;
                            const taxAmount = order.tax || 0;
                            const orderCost = order.items.reduce((sum, item) => sum + (getProductCostPerVial(item.name, item.price / 0.85) * item.quantity), 0);
                            const orderProfit = order.total - orderCost - shippingCost - taxAmount;
                            return (
                              <div className="mt-2 text-right font-mono text-[10px] space-y-0.5 border-t border-slate-900 pt-1.5">
                                <div className="text-slate-400">Products Cost: <span className="text-slate-300">${orderCost.toFixed(2)}</span></div>
                                {shippingCost > 0 && (
                                  <div className="text-slate-400">Postage Cost: <span className="text-slate-300">${shippingCost.toFixed(2)}</span></div>
                                )}
                                {taxAmount > 0 && (
                                  <div className="text-slate-400">Florida Tax (6%): <span className="text-slate-300">${taxAmount.toFixed(2)}</span></div>
                                )}
                                <div className="text-emerald-400 font-semibold">Net Profit: <span className="font-extrabold text-emerald-300">${orderProfit.toFixed(2)}</span></div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Action buttons for orders */}
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {order.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => handleMarkAsPaid(order.id)}
                              disabled={actionLoading !== null}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                            >
                              💵 Mark as Paid
                            </button>
                          )}

                          {order.status === 'placed' && order.paymentStatus === 'paid' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                              disabled={actionLoading !== null}
                              className="px-3 py-1.5 bg-blue-500 text-slate-950 hover:bg-blue-400 font-bold text-[10px] rounded cursor-pointer"
                            >
                              Process Order
                            </button>
                          )}

                          {order.status === 'processing' && (
                            <button
                              onClick={() => {
                                const input = document.getElementById(`track_input_${order.id}`) as HTMLInputElement;
                                const val = input?.value?.trim() || 'USPS94001' + Math.floor(100000 + Math.random() * 900000);
                                handleShipOrder(order.id, val);
                              }}
                              disabled={actionLoading !== null}
                              className="px-3 py-1.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-[10px] rounded cursor-pointer animate-pulse"
                            >
                              Dispatch Shipping
                            </button>
                          )}

                          {order.status === 'shipped' && (
                            <div className="flex flex-col gap-1.5 items-end">
                              <button
                                onClick={() => handleSimulateDeliveryCheck(order.id)}
                                disabled={actionLoading !== null}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                              >
                                🚚 Mark as Delivered (Simulate)
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                disabled={actionLoading !== null}
                                className="px-2 py-1 bg-[#10172a] text-slate-400 hover:text-white text-[9px] font-bold rounded cursor-pointer border border-slate-800"
                              >
                                Direct Complete
                              </button>
                            </div>
                          )}

                          {['placed', 'processing'].includes(order.status) && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                              disabled={actionLoading !== null}
                              className="px-3 py-1.5 bg-slate-900 text-slate-400 hover:text-red-400 text-[10px] rounded border border-slate-800 cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}

                          {confirmDeleteOrderId === order.id ? (
                            <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/40 p-1.5 rounded-xl text-[10px]">
                              <span className="text-rose-400 font-bold font-mono uppercase tracking-widest text-[9px] px-1">Delete order?</span>
                              <button
                                type="button"
                                onClick={async () => {
                                  setConfirmDeleteOrderId(null);
                                  await handleDeleteOrder(order.id);
                                }}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-550 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteOrderId(null)}
                                className="px-2.5 py-1 bg-[#1e293b] hover:bg-slate-800 text-slate-300 border border-slate-700/50 rounded text-[9px] font-bold uppercase transition-all cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                triggerHaptic('light');
                                setConfirmDeleteOrderId(order.id);
                              }}
                              disabled={actionLoading !== null}
                              className="px-3 py-1.5 bg-slate-900 text-rose-400/95 hover:text-rose-300 hover:bg-red-950/20 text-[10px] rounded border border-slate-800 hover:border-red-500/30 cursor-pointer transition-all flex items-center gap-1"
                            >
                              🗑️ Delete Order
                            </button>
                          )}
                        </div>

                        <a
                          href={`mailto:${order.email}?subject=LabRat Order Invoicing ${order.id}&body=Hi ${order.displayName}, %0D%0A%0D%0AYour standard biochemical request (${order.id}) totalling $${typeof order.total === 'number' ? order.total.toFixed(2) : order.total} has been registered on the LabRat console.%0D%0A%0D%0APlease follow these payment instructions: [Insert payment/email links]%0D%0A%0D%0AThank you, %0D%0ALabRat Operations`}
                          className="mt-3 text-rose-300 hover:text-rose-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                          title="Generate payment email invoice"
                        >
                          <Mail className="w-3.5 h-3.5" /> Email Invoice instructions
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ==================================== */}
      {/* SUCCESS ORDER CHECKOUT OVERLAY MODAL */}
      {/* ==================================== */}
      <AnimatePresence>
        {showOrderSuccessModal && lastPlacedOrder && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b1329] border border-cyan-500/30 max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center relative"
            >
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setShowOrderSuccessModal(false)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
                >
                  <XCircle className="w-5 h-5 animate-pulse" />
                </button>
              </div>

              <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full w-fit mx-auto mb-4">
                <BadgeCheck className="w-12 h-12" />
              </div>

              <h3 className="text-lg font-bold text-white">Compound Dispatch Successful</h3>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                Order ID: <span className="text-cyan-400 font-bold">{lastPlacedOrder.id}</span>
              </p>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Your compound reservation request has been processed! No credit card checkout was requested. 
                Our laboratory administrative team will email manual invoicing instructions to <b className="text-white">{lastPlacedOrder.email}</b> shortly.
              </p>

              {lastPlacedOrder.shippingInfo?.carrier && (
                <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-left text-slate-300 font-mono space-y-1.5 mx-auto max-w-sm">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Selected Carrier:</span>
                    <b className="text-[#22d3ee]">{lastPlacedOrder.shippingInfo.carrier} {lastPlacedOrder.shippingInfo.method}</b>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Est. Arrival:</span>
                    <b className="text-white">{lastPlacedOrder.shippingInfo.deliveryEstimate}</b>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-1.5 mt-1 font-bold">
                    <span className="text-slate-400 text-xs">Invoice Total:</span>
                    <b className="text-emerald-400 text-xs font-mono">${lastPlacedOrder.total.toFixed(2)}</b>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    setShowOrderSuccessModal(false);
                    setView('orders');
                  }}
                  className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-lg uppercase tracking-wider cursor-pointer transition-colors active:scale-[0.98]"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setShowOrderSuccessModal(false);
                  }}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer transition-colors border border-slate-800/85 active:scale-[0.98]"
                >
                  Catalog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ========================================= */}
      {/* IMMERSIVE DOSAGE SELECTOR MODAL / OVERLAY */}
      {/* ========================================= */}
      <AnimatePresence>
        {selectedParentProductGroup && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9990] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#070d19] border border-slate-800 max-w-lg md:max-w-4xl w-full rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto"
            >
              <div className="relative p-5 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
                <div className="text-left flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[9px] font-bold tracking-wider uppercase">
                      {selectedParentProductGroup.category}
                    </span>
                    {(() => {
                      const benefit = getSecondaryBenefit(selectedParentProductGroup.baseName, selectedParentProductGroup.category);
                      return (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${getSecondaryBenefitStyle(benefit)}`}>
                          {benefit}
                        </span>
                      );
                    })()}
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight tracking-tight text-left">
                    {selectedParentProductGroup.baseName} Options
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setSelectedParentProductGroup(null); }}
                  className="p-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Product Detail Header */}
                <div className="flex flex-col md:flex-row gap-5 items-stretch md:items-center bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                  <div className="w-full md:w-[22rem] lg:w-[24rem] shrink-0">
                    {(() => {
                      const activeOpt = selectedParentProductGroup.options.find(o => o.id === selectedOptionIdInDrawer) || selectedParentProductGroup.options[0];
                      return <ProductVialVisual name={activeOpt ? activeOpt.name : selectedParentProductGroup.baseName} category={selectedParentProductGroup.category} theme={labratTheme} />;
                    })()}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {getCleanDescription(selectedParentProductGroup.description)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2 py-1 rounded border border-amber-500/20 font-black">
                        {selectedParentProductGroup.category === 'Reconstitution Solvents' ? 'Volume: 30ml Bottle' : 'Volume: 3ml Vial'}
                      </span>
                      <span className="flex items-center gap-1 bg-[#0b1329] px-2 py-1 rounded border border-slate-800">
                        Purity: 99%+
                      </span>
                      <span className="flex items-center gap-1 bg-[#0b1329] px-2 py-1 rounded border border-slate-800">
                        Sourced: Certified Labs
                      </span>
                      <span className="flex items-center gap-1 bg-[#0b1329] px-2 py-1 rounded border border-slate-800 text-cyan-400">
                        COA Certified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Option / Dosage Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
                    Select Milligrams (Dosage Strength):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {selectedParentProductGroup.options.map(opt => {
                      const isSelected = selectedOptionIdInDrawer === opt.id;
                      const optStock = getProductAvailableStock(opt.id, opt.inventory);
                      const isInStock = optStock > 0;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedOptionIdInDrawer(opt.id);
                          }}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer text-center ${
                            isSelected
                              ? isInStock
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                              : isInStock
                                ? 'bg-slate-950 text-emerald-400/70 border-emerald-950 hover:border-emerald-800 hover:text-emerald-300'
                                : 'bg-slate-950 text-amber-400/70 border-amber-950 hover:border-amber-800 hover:text-amber-300'
                          }`}
                        >
                          <span className="font-mono text-sm font-black tracking-wide">{opt.size || '10mg'}</span>
                          <div className="flex flex-col items-center mt-1 scale-90">
                            <span className="text-[9px] text-slate-600 line-through">${opt.price}</span>
                            <span className="text-xs text-cyan-400 font-bold">${getSalePrice(opt.price)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Item Stock & Specs */}
                {(() => {
                  const activeOpt = selectedParentProductGroup.options.find(o => o.id === selectedOptionIdInDrawer) || selectedParentProductGroup.options[0];
                  if (!activeOpt) return null;

                  return (
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Research Specification</div>
                        <div className="text-xs font-mono text-slate-300 mt-1 font-bold">
                          Ref: <span className="text-cyan-400">{activeOpt.id.replace('prod_', '').toUpperCase()}</span>
                        </div>
                      </div>

                      {(() => {
                        const available = getProductAvailableStock(activeOpt.id, activeOpt.inventory);
                        return (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-400">Inventory:</span>
                            {available > 0 ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-extrabold text-[10px]">
                                {available} vials in stock
                              </span>
                            ) : (
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-extrabold text-[10px]">
                                Manufacturing Phase
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}

                {isViewingAsAdmin && (() => {
                  const activeOpt = selectedParentProductGroup.options.find(o => o.id === selectedOptionIdInDrawer) || selectedParentProductGroup.options[0];
                  if (!activeOpt) return null;
                  const estimatedCost = getProductCostPerVial(activeOpt.name, activeOpt.price);
                  const salePrice = getSalePrice(activeOpt.price);
                  const estimatedProfit = salePrice - estimatedCost;
                  const markupPercent = Math.round((estimatedProfit / estimatedCost) * 100);

                  return (
                    <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/15 text-left font-mono text-xs space-y-1.5 text-amber-200">
                      <div className="text-amber-400 font-extrabold uppercase tracking-wider text-[10px]">Admin Financial Highlights</div>
                      <div className="flex justify-between">
                        <span>KaosLabs Cost per Vial:</span>
                        <span className="text-slate-300 font-bold">${estimatedCost.toFixed(2)} <span className="text-[10px] text-slate-500">(+$3.50 shipping allocation)</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Grand Opening Sale Price (-15%):</span>
                        <span className="text-slate-300 font-bold">${salePrice}.00</span>
                      </div>
                      <div className="flex justify-between border-t border-amber-500/10 pt-1.5 mt-1 font-bold text-amber-300">
                        <span>Markup Profit / Vial:</span>
                        <span>${estimatedProfit.toFixed(2)} (<span className="text-emerald-400">+{markupPercent}%</span>)</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Quantity Ticker */}
                <div className="flex items-center justify-between border-t border-slate-900 pt-4">
                  <div className="text-left font-bold">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Purchase Volume:
                    </label>
                    <p className="text-[10px] text-cyan-400 mt-0.5 normal-case font-semibold flex items-center gap-1"><Package className="w-3.5 h-3.5 text-cyan-500 inline" /> Single-Vial Rate (All prices are per individual vial)</p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950 p-1.5 rounded-xl border border-slate-900">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setDrawerQuantity(prev => Math.max(1, prev - 1));
                      }}
                      className="p-1 px-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black font-mono text-white">
                      {drawerQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        const activeOpt = selectedParentProductGroup?.options.find(o => o.id === selectedOptionIdInDrawer) || selectedParentProductGroup?.options[0];
                        const available = activeOpt ? getProductAvailableStock(activeOpt.id, activeOpt.inventory) : 0;
                        setDrawerQuantity(prev => Math.min(available, prev + 1));
                      }}
                      className="p-1 px-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Footer Area with Checkout Summary and CTA */}
              <div className="p-5 bg-slate-950/80 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                {(() => {
                  const activeOpt = selectedParentProductGroup.options.find(o => o.id === selectedOptionIdInDrawer) || selectedParentProductGroup.options[0];
                  if (!activeOpt) return null;
                  
                  const activePrice = getSalePrice(activeOpt.price);
                  const totalSum = activePrice * drawerQuantity;
                  const available = getProductAvailableStock(activeOpt.id, activeOpt.inventory);
                  const canAdd = available > 0;

                  return (
                    <>
                      <div className="text-left w-full sm:w-auto">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Estimated Total (15% Sale Applied)</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-slate-500 line-through">${activeOpt.price * drawerQuantity}.00</span>
                          <div className="text-xl font-black text-cyan-400">${totalSum}.00</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto justify-end">
                        {isViewingAsAdmin ? (
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                setSelectedParentProductGroup(null);
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 order-2 sm:order-1"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
                            </button>
                            <div className="flex gap-2 flex-1 order-1 sm:order-2">
                              <button
                                type="button"
                                onClick={() => {
                                  triggerHaptic('light');
                                  setSelectedParentProductGroup(null);
                                  setEditingProduct(activeOpt);
                                  setProductValidationError(null);
                                  setProductForm({
                                    name: activeOpt.name,
                                    description: activeOpt.description,
                                    category: activeOpt.category,
                                    price: activeOpt.price,
                                    inventory: activeOpt.inventory
                                  });
                                  setShowProductModal(true);
                                }}
                                className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-xl border border-slate-800 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit Parameters
                              </button>
                              {confirmDeleteProductId === activeOpt.id ? (
                                <div className="flex items-center gap-1.5 bg-rose-950/20 border border-rose-500/30 p-1 rounded-xl text-[10px]" id={`confirm-shop-delete-${activeOpt.id}`}>
                                  <span className="text-rose-400 font-bold font-mono uppercase tracking-widest text-[9px] px-1">Delete item?</span>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      triggerHaptic('medium');
                                      setConfirmDeleteProductId(null);
                                      setSelectedParentProductGroup(null);
                                      await handleDeleteProduct(activeOpt.id);
                                    }}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 active:scale-[0.95] text-white rounded text-[9px] font-bold uppercase transition"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteProductId(null)}
                                    className="px-2 py-1 bg-[#1e293b] hover:bg-slate-800 active:scale-[0.95] text-slate-300 border border-slate-700/50 rounded text-[9px] font-bold uppercase transition"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic('light');
                                    setConfirmDeleteProductId(activeOpt.id);
                                  }}
                                  className="px-3.5 py-2 bg-slate-900 hover:bg-red-500/10 text-red-400 rounded-xl border border-slate-800 cursor-pointer text-xs flex items-center justify-center font-bold"
                                  title="Delete Option"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                setSelectedParentProductGroup(null);
                              }}
                              className="w-full sm:w-auto px-5 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 order-2 sm:order-1"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
                            </button>
                            <button
                              type="button"
                              disabled={!canAdd}
                              onClick={() => {
                                triggerHaptic('medium');
                                // Add selected activeOpt to cart with specified dosage drawer quantity
                                const existingIndex = cart.findIndex(c => c.product.id === activeOpt.id);
                                let newCart = [...cart];
                                const available = getProductAvailableStock(activeOpt.id, activeOpt.inventory);
                                if (existingIndex > -1) {
                                  newCart[existingIndex] = {
                                    product: activeOpt,
                                    quantity: Math.min(available, newCart[existingIndex].quantity + drawerQuantity)
                                  };
                                } else {
                                  newCart.push({
                                    product: activeOpt,
                                    quantity: Math.min(available, drawerQuantity)
                                  });
                                }
                                setCart(newCart);
                                safeLocalStorage.setItem('labrat_member_cart', JSON.stringify(newCart));
                                setSelectedParentProductGroup(null);
                              }}
                              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer order-1 sm:order-2 flex-1 ${
                                canAdd
                                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-[0.97]'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {canAdd ? (
                                <>
                                  <ShoppingCart className="w-4 h-4" /> Add {drawerQuantity} Vial{drawerQuantity > 1 ? 's' : ''} to Cart
                                </>
                              ) : (
                                <>
                                  Manufacturing Phase
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ========================================= */}
      {/* PRODUCT CREATION/EDITION MODAL (ADMIN ONLY) */}
      {/* ========================================= */}
      <AnimatePresence>
        {showProductModal && isAdminUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b1329] border border-slate-800 max-w-md w-full p-6 rounded-2xl text-left"
            >
              <h3 className="text-base font-bold text-white mb-4">
                {editingProduct ? 'Modify Product Parameters' : 'Register New Compound / Supply'}
              </h3>
              
              <form onSubmit={handleSaveProduct} className="space-y-4">
                {productValidationError && (
                  <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl p-3 text-[11px] font-medium leading-relaxed">
                    ⚠️ {productValidationError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-name">Product Name</label>
                  <input 
                    type="text" 
                    required
                    id="prod-name"
                    placeholder="E.g. TB-500 Pure Powder"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-desc">Description</label>
                  <textarea 
                    required
                    rows={2}
                    id="prod-desc"
                    placeholder="Biochemical mechanisms, dosage volumes..."
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-cat">Category</label>
                    <input 
                      type="text" 
                      required
                      id="prod-cat"
                      placeholder="E.g. Healing"
                      value={productForm.category}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-price">Research Price ($)</label>
                    <input 
                      type="number" 
                      required
                      id="prod-price"
                      min={0}
                      placeholder="125"
                      value={productForm.price || ''}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1" htmlFor="prod-inventory">Stock Inventory (Vials/Sets)</label>
                  <input 
                    type="number" 
                    required
                    id="prod-inventory"
                    placeholder="30"
                    min={0}
                    value={productForm.inventory}
                    onChange={(e) => setProductForm(prev => ({ ...prev, inventory: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder:text-slate-600 rounded-lg text-xs"
                  />
                </div>

                {productForm.name && productForm.price > 0 && (
                  <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl space-y-1 text-[11px] font-mono text-slate-300">
                    <div className="text-cyan-400 font-bold uppercase tracking-wider text-[9px] mb-1">Financial Estimates (KaosLabs.eu)</div>
                    <div className="flex justify-between">
                      <span>Estimated Cost/Vial (incl. avg shipping):</span>
                      <span className="text-white font-semibold">${getProductCostPerVial(productForm.name, productForm.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grand Opening Sale Price (-15%):</span>
                      <span className="text-emerald-400 font-semibold">${getSalePrice(productForm.price || 0)}.00</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800/50 pt-1.5 mt-1 font-bold">
                      <span>Estimated Profit per Vial:</span>
                      {(() => {
                        const cost = getProductCostPerVial(productForm.name, productForm.price || 0);
                        const sale = getSalePrice(productForm.price || 0);
                        const profit = sale - cost;
                        return <span className={profit >= 0 ? "text-amber-300" : "text-rose-400"}>${profit.toFixed(2)}</span>;
                      })()}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded-lg cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    {actionLoading === 'save_product' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />} {editingProduct ? 'Apply Edit' : 'Add to Catalog'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ========================================= */}
      {/* NORWAY & SWITZERLAND PEPTIDE HERITAGE MODAL */}
      {/* ========================================= */}
      <AnimatePresence>
        {showNorwayModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            {/* Background click to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => { triggerHaptic('light'); setShowNorwayModal(false); }} />

            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 20 }}
              className="bg-[#0b1329] border border-cyan-500/20 max-w-2xl w-full p-5 sm:p-8 rounded-2xl text-left shadow-2xl relative overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Decorative premium header gradient lines */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-[#2176ff] to-[#a05eff]" />
              <div className="absolute top-1.5 inset-x-0 h-px bg-white/10" />

              {/* Header section with branding & Norway flag */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 flex items-center justify-center text-3xl shadow-inner select-none animate-pulse">
                    🇳🇴
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">Specialty Report</span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded">Biotech History</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                      The European Peptide Heritage
                    </h3>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setShowNorwayModal(false); }}
                  className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-slate-100 transition cursor-pointer"
                  aria-label="Close heritage details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable factual body */}
              <div className="flex-1 overflow-y-auto pr-1 py-5 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                <p className="text-xs text-slate-400 border-l-2 border-cyan-500 pl-3 italic">
                  "By prioritizing micro-batch crystalline purity over industrial scale bulk crystallization, Switzerland and Scandinavia's molecular baseline outperforms mass-market chemical manufacturers consistently." 
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">— European Biological Synthesis Review (EBSR)</span>
                </p>

                {/* Section 1: History timeline */}
                <div>
                  <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2.5">
                    <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    1. A Century of Peptide Chemistry (Longer than USA &amp; China)
                  </h4>
                  <p className="text-slate-300 mb-3 block">
                    Many researchers mistakenly assume modern peptide synthesis is a recent byproduct of large-scale Chinese factories. In fact, Europe is the undisputed birthplace of peptide chemistry, holding an operational pedigree decades older than industrial export zones:
                  </p>
                  
                  {/* Timeline cards */}
                  <div className="space-y-3 pl-2 border-l border-slate-800">
                    <div className="relative pl-4">
                      <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 bg-cyan-400 rounded-full border border-slate-950" />
                      <div className="text-white font-bold text-xs">1902 — Emil Fischer Swiss-German Genesis</div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Nobel Laureate Emil Fischer synthesized the first true peptide chain (glycylglycine) in Switzerland / Germany, coining the scientific term "peptide" and defining the covalent amide bonds that bind amino acids.
                      </p>
                    </div>
                    <div className="relative pl-4">
                      <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 bg-purple-400 rounded-full border border-slate-950" />
                      <div className="text-white font-bold text-xs">Mid-1950s — Norwegian High-Latitude Bio-Extraction</div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Norwegian biochemistry initiatives in Oslo and Bergen pioneered the isolation of cold-active enzymes, bio-active micro-molecules, and metabolic defense peptide chains in arctic marine organisms. This established early European techniques for purifying crystalline organic compounds.
                      </p>
                    </div>
                    <div className="relative pl-4">
                      <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950" />
                      <div className="text-white font-bold text-xs">1971 — The Swiss Gold-Standard (Bachem)</div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Bachem AG was founded in Bubendorf, Switzerland, initiating the world's first dedicated industrial line of synthetic peptides. This established Swiss-standard Solid-Phase Peptide Synthesis (SPPS) decades before mass commercial synthesis appeared in China or North America.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Glacial Water */}
                <div>
                  <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2.5">
                    <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    2. Glacier-Pure Aqueous Baselines
                  </h4>
                  <p className="text-slate-300">
                    In high-fidelity synthesis, <strong>water is the universal solvent</strong>. During the acid cleavage stage of peptide synthesis, even sub-parts-per-million micro-contaminants can warp molecular strands or trigger cross-chain peptide bonding.
                  </p>
                  <p className="text-slate-300 mt-2">
                    Norway's isolated sub-alpine geographic locations tap into highly pristine deep aquifers and mountain glacier waters. This provides a clean native solvent baseline that features zero industrial runoffs or heavy metals. As a result, the active substance undergoes synthesis without baseline contamination.
                  </p>
                </div>

                {/* Section 3: Micro-Batch vs Bulk */}
                <div>
                  <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2.5">
                    <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    3. Swiss-Scandinavian Micro-Batching vs. Mass Sourcing
                  </h4>
                  
                  {/* Factual comparison box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                    <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-left">
                      <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs mb-2 uppercase">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Modern Bulk Factories (China/Bulk)
                      </div>
                      <ul className="space-y-2 text-xs text-slate-400">
                        <li>• Focused on multi-ton industrial chemical synthesis volumes</li>
                        <li>• Rapid high-temperature cleavage processes that compromise amino-acid integrity</li>
                        <li>• Higher incidence of truncated chains (missing essential terminal groups)</li>
                        <li>• Residual salts (TFA leftover content often exceeds standard thresholds)</li>
                      </ul>
                    </div>

                    <div className="bg-cyan-950/20 border border-cyan-500/20 p-4 rounded-xl text-left">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs mb-2 uppercase">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> LabRat Sourcing (Norway &amp; Switzerland)
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        <li>• Exclusive low-temperature micro-batching</li>
                        <li>• Sterile vacuum cryogenic freeze-drying (lyophilization) preserves shape</li>
                        <li>• Guaranteed 99.2%+ purity levels under strict ISO 17025 audits</li>
                        <li>• Certified zero heavy-metal profiling and flawless sequence length</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 4: GMP Sterile Protocols */}
                <div>
                  <h4 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 mb-2">
                    <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    4. Rigid EU GMP Annex 1 Compliance
                  </h4>
                  <p className="text-slate-300">
                    Norway and Switzerland hold the highest biological manufacturing criteria. Sourcing labs comply strictly with <strong>EU GMP Annex 1 guidelines for sterile compounds</strong> (ISO Class 5 environment, laminar horizontal airflow, and continuous automated optical sensors). Every step is recorded in unalterable digital audit systems, satisfying absolute research standards.
                  </p>
                </div>
              </div>

              {/* Action Close Footer */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase flex items-center gap-1.5">
                  {renderWithLabRatBranding("LabRat")} <span className="text-slate-400 font-medium">Certified Bioresearch Sourcing</span>
                </span>
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setShowNorwayModal(false); }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition active:scale-98"
                >
                  Return to Compound Shop
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ========================================= */}
      {/* CERTIFICATION SPECIFICATION DETAIL MODAL */}
      {/* ========================================= */}
      <AnimatePresence>
        {selectedCertKey && CERTIFICATION_DETAILS[selectedCertKey] && (() => {
          const cert = CERTIFICATION_DETAILS[selectedCertKey];
          return (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-[#0b1329] border border-slate-800 max-w-lg w-full p-5 sm:p-6 rounded-2xl text-left shadow-2xl relative overflow-hidden"
              >
                {/* Decorative gradients */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
                
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setSelectedCertKey(null); }}
                  className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-slate-100 transition cursor-pointer"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Content Header */}
                <div className="flex items-start gap-3.5 mt-2">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/25 shrink-0 text-cyan-400">
                    {cert.iconType === 'verified' && <BadgeCheck className="w-6 h-6 text-cyan-400" />}
                    {cert.iconType === 'check' && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                    {cert.iconType === 'list' && <ClipboardList className="w-6 h-6 text-blue-400" />}
                    {cert.iconType === 'info' && <CheckCircle className="w-6 h-6 text-purple-400" />}
                    {cert.iconType === 'shield' && <BadgeCheck className="w-6 h-6 text-cyan-400" />}
                    {cert.iconType === 'alert' && <AlertTriangle className="w-6 h-6 text-amber-400" />}
                    {cert.iconType === 'flask' && <CheckCircle className="w-6 h-6 text-slate-300" />}
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${cert.badgeClass} block w-fit mb-1`}>
                      {cert.badgeLabel}
                    </span>
                    <h3 className="text-lg font-black tracking-tight text-white leading-tight">
                      {cert.title}
                    </h3>
                  </div>
                </div>

                <div className="h-px bg-slate-800/80 my-4" />

                {/* Short Paragraph Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-left">
                  {renderWithLabRatBranding(cert.description)}
                </p>

                {/* Sub-framework points check */}
                <div className="mt-4 space-y-2.5">
                  <h4 className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                    Key Standards & Verification
                  </h4>
                  <ul className="space-y-2 pl-0.5">
                    {cert.details.map((point, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed text-left">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 shrink-0 block" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button close */}
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => { triggerHaptic('light'); setSelectedCertKey(null); }}
                    className="w-full sm:w-auto px-5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl cursor-pointer transition active:scale-98"
                  >
                    Close Details
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Floating persistent cart trigger for all views when items are selected */}
      <AnimatePresence>
        {cart.length > 0 && !['cart', 'checkout'].includes(view) && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[9950]"
          >
            <button
              type="button"
              onClick={() => { triggerHaptic('medium'); setView('cart'); }}
              className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black px-5 py-4 rounded-full shadow-[0_5px_22px_rgba(6,182,212,0.4)] hover:shadow-[0_5px_28px_rgba(6,182,212,0.6)] hover:scale-[1.04] active:scale-[0.96] transition-all cursor-pointer select-none group border border-cyan-300/20"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-md">
                  {totalQty}
                </span>
              </div>
              <span className="text-xs uppercase tracking-wider font-extrabold pr-0.5">View Research Cart</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

interface CertificationDetail {
  title: string;
  iconType: 'check' | 'verified' | 'list' | 'info' | 'shield' | 'alert' | 'flask';
  badgeLabel: string;
  badgeClass: string;
  description: string;
  details: string[];
}

const CERTIFICATION_DETAILS: Record<string, CertificationDetail> = {
  'authorized_supply': {
    title: "Authorized Laboratory Sourcing",
    iconType: 'shield',
    badgeLabel: "Authorized Lab Supply",
    badgeClass: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/10",
    description: "LabRat is an authorized chemical sourcing gatekeeper operating transparently under verified scientific distributor frameworks.",
    details: [
      "Rigorous pre-vetting of all member laboratory credentials",
      "Secured, auditable checkout & delivery rails",
      "Strict control over inventory, lot numbers, and formulation records"
    ]
  },
  'research_only': {
    title: "Strictly Research Use Only (RUO)",
    iconType: 'alert',
    badgeLabel: "🔬 Research Use Only",
    badgeClass: "bg-amber-500/20 text-amber-300 border border-amber-500/10",
    description: "All compounds, chemical sequences, and bioresearch materials are strictly synthesized and provisioned for in-vitro laboratory analysis, academic investigations, and pre-clinical assay research.",
    details: [
      "Not for direct human use, veterinary diagnostics, or household application",
      "Recipient assumes all liability for protocol testing, handle parameters, and compound clearance",
      "Mandatory alignment with environmental safety and clinical compliance boundaries"
    ]
  },
  '99_purity': {
    title: "99.0% High-Purity Synthesis Standard",
    iconType: 'verified',
    badgeLabel: "99% Purity",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    description: "Every compound batch undergoes multi-phase HPLC (High-Performance Liquid Chromatography) and MS (Mass Spectrometry) validation to guarantee chemical composition and eliminate baseline impurities.",
    details: [
      "Active synthesis content exceeds 99.0% purity threshold consistently",
      "Zero cross-contamination or synthetic salt residues",
      "Vacuum lyophilized inside clinical classrooms under sterile inert argon gas shroud"
    ]
  },
  'certified_source': {
    title: "Certified Global Laboratories Sourcing",
    iconType: 'check',
    badgeLabel: "Certified Source",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    description: "Materials are exclusively procured from audited, established pharmaceutical synthesis laboratories who conform to premium global compound standards.",
    details: [
      "Traceability loops for every raw starter chemical substrate",
      "Continuous equipment recalibration and thermal monitoring audits",
      "Sourced from state-of-the-art facilities with spotless regulatory records"
    ]
  },
  'coas_available': {
    title: "Certificate of Analysis (COA) Reports",
    iconType: 'list',
    badgeLabel: "COAs Available",
    badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    description: "We maintain fully transparent analytical chemistry records. Certified lab COAs showcasing purity testing, heavy metal scans, and water content margins are available on demand.",
    details: [
      "Independently verified by third-party testing channels",
      "Matches specific synthesis lot/batch ID assigned to your delivery",
      "Available instantly upon request via helpdesks or dispatch tickets"
    ]
  },
  'sop_verified': {
    title: "Standard Operating Procedures (SOP) Verified",
    iconType: 'info',
    badgeLabel: "SOP Verified",
    badgeClass: "bg-purple-500/10 text-purple-300 border border-purple-500/20",
    description: "All logistic handling, packaging, secure compound wrapping, and administrative verification is strictly cataloged under rigid Standard Operating Procedures.",
    details: [
      "Uniform, repeatable procedures preventing container damage or degradation",
      "Double-witness system for dose accuracy and compounding scale measurements",
      "Strict compliance with storage humidity and light insulation protocols"
    ]
  },
  'iso_17025': {
    title: "ISO/IEC 17025 Laboratory Accreditation",
    iconType: 'flask',
    badgeLabel: "ISO 17025",
    badgeClass: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    description: "Refers to the prime international standard for testing and calibration laboratories. Confirming absolute technical competence, precision error boundaries, and valid empirical testing processes.",
    details: [
      "Rigid environmental controls safeguarding compounding precision",
      "NIST-traceable calibration of balances, pipettes, and spectrophotometers",
      "Strict data integrity checks avoiding reporting biases"
    ]
  },
  'iso_9001': {
    title: "ISO 9001:2015 Quality Management System",
    iconType: 'info',
    badgeLabel: "ISO 9001",
    badgeClass: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    description: "International framework that regulates our raw compound procurement, supplier alignment, quality oversight loops, and logistical response speeds.",
    details: [
      "Comprehensive vendor performance audits and material receipt records",
      "Continuous improvement feedback loops monitoring dispatch speeds and packaging safety",
      "Proactive risk management analysis protecting bio-stability in transit"
    ]
  },
  'eu_gmp': {
    title: "EU GMP Annex 1 Sterile Compounds",
    iconType: 'verified',
    badgeLabel: "EU GMP Annex 1",
    badgeClass: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    description: "Compounds are produced in certified facilities respecting the European Union's Good Manufacturing Practice (GMP) Annex 1 guidelines for sterile medicinal and chemical compound manufacture.",
    details: [
      "Rigid ISO Class 5 cleanroom conditions using dynamic airflow systems",
      "Comprehensive bioburden and particulate monitoring",
      "Advanced terminal sterilization and aseptic lyophilization (freeze-drying)"
    ]
  },
  'annex_11': {
    title: "Annex 11 Electronic Records Security",
    iconType: 'shield',
    badgeLabel: "Annex 11",
    badgeClass: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    description: "Compliant with international regulatory frameworks for computerized systems in clinical research and life sciences.",
    details: [
      "Unmodifiable audit trails tracking batch releases and catalog changes",
      "High-grade encryption of sensitive investigator details and log inputs",
      "Role-based privilege configuration that keeps medical parameters completely pristine"
    ]
  },
  'gdp': {
    title: "Good Distribution Practice (GDP)",
    iconType: 'flask',
    badgeLabel: "GDP Standard",
    badgeClass: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    description: "Strict logistics framework protecting chemical composition and bio-potency during handling, containment, packing, and global distribution.",
    details: [
      "Insulated, light-sealed and highly protected packaging guards",
      "Strict tracking to prevent exposure to cross-contaminants or extreme climates",
      "Fully documented chain of custody from deep synthesis storage to dispatch delivery"
    ]
  }
};
