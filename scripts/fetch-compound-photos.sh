#!/usr/bin/env bash
# Downloads the 39 Higgsfield compound vial photos into src/assets/product-photos/.
# Must run from a session whose network egress allows d8j0ntlcm91z4.cloudfront.net.
# After download, optionally downscale to ~900x900, then `npm run build`, commit, push.
set -euo pipefail
cd "$(dirname "$0")/.."
DEST="src/assets/product-photos"
BASE="https://d8j0ntlcm91z4.cloudfront.net/user_3EySHfd5WtGWSyMpbX7CTnKeTxH"
mkdir -p "$DEST"

# filename<TAB>source-url  (source extension may be .png or .jpeg; saved as .png)
while IFS=$'\t' read -r name url; do
  [ -z "$name" ] && continue
  echo "↓ $name"
  curl -fsSL "$BASE/$url" -o "$DEST/$name"
done <<'EOF'
_compound-klow.png	hf_20260612_191939_06fc791c-6d8f-4da3-a3ef-22f43e2e171e.png
_compound-bpc-157.png	hf_20260612_193048_a21418cb-0f15-4801-abd3-7442fe611030.png
_compound-tirzepatide.png	hf_20260612_193051_7fa367e9-0f06-496e-8d4c-265910577099.png
_compound-retatrutide.png	hf_20260612_193053_0e441ccd-9fc4-42de-b939-7e3f3740e50b.png
_compound-semaglutide.png	hf_20260612_193056_8306eb7d-8b40-4716-9b25-0ad63e618a65.png
_compound-cagrilintide.png	hf_20260612_193142_9b5bf95c-917e-43ea-8fe6-79135d40ad95.png
_compound-mazdutide.png	hf_20260612_193145_82ae8ef0-986c-4c58-8e51-3db55bc97ae5.png
_compound-aod-9604.png	hf_20260612_193206_edfddfe1-83d9-47da-9368-b91b2b238110.png
_compound-tb-500.png	hf_20260612_193209_b7c85899-75da-46ba-b22e-156138ff6bba.jpeg
_compound-bpc-157-tb-500-blend.png	hf_20260612_193227_906d041d-b1a6-4d58-a205-f6afcb4cbc85.png
_compound-cjc-1295-ipamorelin.png	hf_20260612_193229_80c2a328-f973-442d-aa7a-4d5ec3172f2e.png
_compound-cjc-1295-without-dac.png	hf_20260612_193250_51f5bd74-0d1d-4d76-a36c-95d1645ccb42.png
_compound-ipamorelin.png	hf_20260612_193315_d55af26e-cc9c-4001-9170-96448dc515c7.png
_compound-tesamorelin.png	hf_20260612_193335_cab2940e-16a0-45ec-8d13-59e38cfafc5e.png
_compound-sermorelin.png	hf_20260612_193354_aac676a8-408f-4399-9ee8-3e0030281b42.png
_compound-mots-c.png	hf_20260612_193416_96e68f71-eedd-4ff8-bf3a-f944b67c0623.png
_compound-igf-1-lr3.png	hf_20260612_193435_ae5d3fe7-1844-4511-94e8-92189a15c1e9.png
_compound-arachidonic-acid.png	hf_20260612_193453_264725c5-02a4-4ece-87be-4597571d2afc.png
_compound-glow.png	hf_20260612_193512_f8aca0c7-bf9e-4f7d-aeaf-96e4157c4ae0.png
_compound-melanotan-i.png	hf_20260612_193530_91351bef-3dc4-47ed-9ac8-197232336382.png
_compound-melanotan-ii.png	hf_20260612_193550_b6c7490c-93a8-4d3e-8b2e-3de417c76666.png
_compound-snap-8.png	hf_20260612_193607_9063b666-150f-4103-95fc-497f2b1f1987.png
_compound-pt-141.png	hf_20260612_193626_aeda9ff0-182c-4b21-88e5-d011f0102719.png
_compound-nad.png	hf_20260612_193649_c2988d40-2a0d-4b31-8b5d-6d3a2728835a.png
_compound-glutathione.png	hf_20260612_193710_6bba5a43-feba-40a4-adf1-765b56ed89d7.png
_compound-semax.png	hf_20260612_193732_a98ad971-807a-4d50-83cd-1123a4d3478c.png
_compound-selank.png	hf_20260612_193751_571a13cc-d54a-48f8-b23e-585723c47430.png
_compound-semax-selank.png	hf_20260612_193811_9b8ed3a6-42c7-4931-88d1-cf8328cf3a23.png
_compound-epitalon.png	hf_20260612_193835_9f2b9592-99a1-4998-8565-28fabc54e7f4.png
_compound-ss-31.png	hf_20260612_193859_beeb0ad5-f09c-416a-84f0-a863d2612ece.png
_compound-slu-pp-332.png	hf_20260612_193928_e7a4efc2-a4ab-4edf-8990-35e9587d5501.png
_compound-5-amino-1mq.png	hf_20260612_193946_b4b50bb0-91b8-4d61-bda2-7dc70a2e481e.png
_compound-thymosin-alpha-1.png	hf_20260612_194018_19475767-84a1-4090-9c59-f62cc9e1b21b.png
_compound-kpv-peptide.png	hf_20260612_194033_13ca295d-f219-4868-a9bd-89973d550bf7.png
_compound-dsip.png	hf_20260612_194055_7470eb64-4d45-4f25-b60a-dafbd5e1abc4.png
_compound-ghk-cu.png	hf_20260612_194117_d609ffa5-b8df-44f0-bfc3-04792ce2837a.png
_compound-bac-water.png	hf_20260612_194120_d070ad26-c20b-4b1a-933e-c2c7e6c3fde9.png
_compound-lemon-bottle.png	hf_20260612_194136_379451ad-2bc0-40c2-88ab-424a54fb41c4.png
EOF

# ARA-290 (job e8f66059-71cd-44f5-922c-770ca54cfd8c) was still rendering when this
# script was written. Resolve its final URL via the Higgsfield job and save it as
# _compound-ara-290.png, or regenerate from _compound-klow.png if missing.
echo "NOTE: fetch _compound-ara-290.png separately (job e8f66059-71cd-44f5-922c-770ca54cfd8c)."
echo "Done. $(ls "$DEST"/_compound-*.png | wc -l) compound photos present."
