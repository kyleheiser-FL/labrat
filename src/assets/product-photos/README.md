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

Resolution order per product: exact per-product photo → type archetype →
procedural vial render. Generated with Higgsfield (soul_2), 3:4 portrait.
