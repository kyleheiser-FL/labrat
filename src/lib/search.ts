// ─────────────────────────────────────────────────────────────────────────────
// Ranked compound search
//
// A small dependency-free scorer that makes autocomplete useful from the very
// first keystroke: a single letter surfaces name-prefix matches at the top
// instead of an unranked pile of substring hits. Matching spans the name,
// chemical name, a curated alias table (shorthand like "tren", "sema", "glp"),
// and as a last resort the description/benefits — each weighted so the most
// relevant compound wins.
// ─────────────────────────────────────────────────────────────────────────────

// Common shorthand / street names → the term that appears in the catalog. Lets
// "tren" find Trenbolone, "glp" find the GLP-1 agonists, "wegovy" find
// Semaglutide, etc., without bloating every data row with synonyms.
const ALIASES: Record<string, string[]> = {
  semaglutide: ['ozempic', 'wegovy', 'sema', 'glp', 'glp1', 'glp-1'],
  tirzepatide: ['mounjaro', 'zepbound', 'tirz', 'gip'],
  retatrutide: ['reta', 'triple g', 'tripleg'],
  cagrilintide: ['cagri', 'amylin'],
  trenbolone: ['tren'],
  testosterone: ['test', 'tst', 'trt'],
  nandrolone: ['deca', 'npp'],
  oxandrolone: ['anavar', 'var'],
  stanozolol: ['winstrol', 'winny'],
  methandrostenolone: ['dbol', 'dianabol'],
  drostanolone: ['masteron', 'mast'],
  boldenone: ['eq', 'equipoise'],
  oxymetholone: ['anadrol', 'drol'],
  methenolone: ['primobolan', 'primo'],
  'bpc-157': ['bpc', 'bpc157'],
  'tb-500': ['tb500', 'tb', 'thymosin beta'],
  'mots-c': ['motsc', 'mots'],
  'ghk-cu': ['ghk', 'copper peptide'],
  'pt-141': ['pt141', 'pt', 'bremelanotide'],
  'melanotan-ii': ['mt2', 'mt-2', 'melanotan 2', 'tanning'],
  'melanotan-i': ['mt1', 'mt-1', 'melanotan 1'],
  'ipamorelin': ['ipam', 'ghrp'],
  'cjc-1295': ['cjc', 'cjc1295'],
  'igf-1-lr3': ['igf', 'igf1', 'igf-1', 'lr3'],
  'ss-31': ['ss31', 'elamipretide'],
  '5-amino-1mq': ['amino', '1mq', 'aminomq'],
  'nad': ['nad+', 'nadplus'],
  'aod-9604': ['aod', 'aod9604'],
  'thymosin-alpha-1': ['ta1', 'thymosin alpha'],
  'kpv-peptide': ['kpv'],
  'slu-pp-332': ['slu', 'slupp', 'slu-pp'],
};

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

// Is `q` a subsequence of `text`? ("trz" ⊂ "tirzepatide"). Powers typo/skip
// tolerance so a fast or sloppy typist still gets a hit.
function isSubsequence(q: string, text: string): boolean {
  let i = 0;
  for (let j = 0; j < text.length && i < q.length; j++) {
    if (q[i] === text[j]) i++;
  }
  return i === q.length;
}

export interface SearchFields {
  name: string;
  chemicalName?: string;
  /** Lower-priority free text (description, benefits) joined into one string. */
  extra?: string;
  /** Stable key used to look up curated aliases (the item id or slug). */
  aliasKey?: string;
}

// Higher score = better match. 0 means "no match" and the item is dropped.
export function scoreMatch(query: string, fields: SearchFields): number {
  const q = normalize(query);
  if (!q) return 0;

  const name = normalize(fields.name);
  const chem = fields.chemicalName ? normalize(fields.chemicalName) : '';
  const extra = fields.extra ? normalize(fields.extra) : '';
  const words = name.split(/[^a-z0-9]+/).filter(Boolean);

  let score = 0;

  if (name === q) score = Math.max(score, 1000);
  else if (name.startsWith(q)) score = Math.max(score, 600);
  else if (words.some((w) => w.startsWith(q))) score = Math.max(score, 400);
  else if (name.includes(q)) score = Math.max(score, 220);

  if (chem) {
    if (chem.startsWith(q)) score = Math.max(score, 300);
    else if (chem.split(/[^a-z0-9]+/).filter(Boolean).some((w) => w.startsWith(q)))
      score = Math.max(score, 200);
    else if (chem.includes(q)) score = Math.max(score, 120);
  }

  // Curated aliases / shorthand.
  if (fields.aliasKey) {
    const aliases = ALIASES[normalize(fields.aliasKey)] || [];
    for (const a of aliases) {
      if (a === q) { score = Math.max(score, 500); break; }
      if (a.startsWith(q)) { score = Math.max(score, 320); }
      else if (a.includes(q)) { score = Math.max(score, 140); }
    }
  }

  // Fuzzy subsequence on the name — only worth points for queries of 2+ chars,
  // so a single letter doesn't fuzzy-match half the catalog.
  if (score === 0 && q.length >= 2) {
    const compactName = name.replace(/[^a-z0-9]/g, '');
    if (isSubsequence(q, compactName)) score = Math.max(score, 70);
  }

  // Last resort: description / benefits text.
  if (score === 0 && q.length >= 3 && extra.includes(q)) score = 40;

  return score;
}

// Rank items by match score (descending), dropping non-matches. Ties keep the
// input order via a stable sort, then fall back to alphabetical by name.
export function rankSearch<T>(
  query: string,
  items: T[],
  toFields: (item: T) => SearchFields,
): T[] {
  const q = normalize(query);
  if (!q) return items;
  return items
    .map((item, index) => ({ item, index, score: scoreMatch(q, toFields(item)) }))
    .filter((r) => r.score > 0)
    .sort((a, b) =>
      b.score - a.score ||
      a.index - b.index ||
      normalize(toFields(a.item).name).localeCompare(normalize(toFields(b.item).name)),
    )
    .map((r) => r.item);
}
