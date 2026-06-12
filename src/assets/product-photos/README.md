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
overlaid by the UI, so variants stay distinguishable. Files are named
`_compound-<base-slug>.png` where the slug is the product name minus its
strength, parentheticals, and "China"/"US Warehouse" suffix:

  "Tirzepatide China (30mg)"        → _compound-tirzepatide.png
  "BPC-157 / TB-500 Blend (10mg)"   → _compound-bpc-157-tb-500-blend.png
  "SS-31 (Elamipretide) (10mg)"     → _compound-ss-31.png
  "NAD+ (500mg)"                    → _compound-nad.png

Resolution order per product: exact per-product photo → compound photo →
type archetype → procedural vial render. Generated with Higgsfield, 1:1
studio shots with the holographic LABRAT sticker.
