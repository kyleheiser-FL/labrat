# Per-product photography

Drop real or AI-generated product photos here and they are wired in
automatically at build time — no code changes needed.

**Naming:** lowercase product name, non-alphanumerics → hyphens.
  "BPC-157 (10mg)"                → bpc-157-10mg.png
  "Retatrutide US Warehouse (20mg)" → retatrutide-us-warehouse-20mg.png

**Format:** PNG/WebP, transparent or dark background, portrait, ~800×1100.
Products without a photo fall back to the procedural vial render.

## Type archetype photos

For broad coverage without one photo per SKU, drop a single ultra-realistic
studio shot per vial type. Each is used for every product of that type that has
no per-product photo of its own. Powder color follows the chemistry:

  _archetype-peptide-copper.png  → copper peptides (GHK-Cu / KLOW): vivid BLUE powder
  _archetype-peptide-white.png   → all other peptides: WHITE lyophilized powder
  _archetype-solvent.png         → reconstitution solvents (BAC water): clear liquid

## Compound photos

One branded photo per peptide compound, shared by every strength and source
(Norway / China / US Warehouse) of that compound — the source flag badge is
overlaid by the UI, so variants stay distinguishable. Two variants per
compound, named by the product name minus its strength, parentheticals, and
"China"/"US Warehouse" suffix:

  _compound-<base-slug>-cutout.png  → transparent-background cutout (preferred,
                                      used on every theme)
  _compound-<base-slug>.png         → 1:1 dark studio shot (fallback)

  "Tirzepatide China (30mg)"        → _compound-tirzepatide-cutout.png
  "BPC-157 / TB-500 Blend (10mg)"   → _compound-bpc-157-tb-500-blend-cutout.png
  "SS-31 (Elamipretide) (10mg)"     → _compound-ss-31-cutout.png
  "NAD+ (500mg)"                    → _compound-nad-cutout.png

Resolution order per product: exact per-product photo → compound cutout →
compound studio shot → type archetype → procedural vial render. Generated
with Higgsfield (holographic LABRAT sticker), vendored locally at ~900×900;
re-download with scripts/fetch-compound-photos.sh and
scripts/fetch-compound-cutouts.sh.
