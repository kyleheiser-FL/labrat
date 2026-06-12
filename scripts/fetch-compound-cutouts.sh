#!/usr/bin/env bash
# Downloads the 39 Higgsfield transparent-background vial cutouts (used on the
# clinical-light theme) into src/assets/product-photos/ as _compound-<slug>-cutout.png.
# Must run from a session whose network egress allows d8j0ntlcm91z4.cloudfront.net.
set -euo pipefail
cd "$(dirname "$0")/.."
DEST="src/assets/product-photos"
BASE="https://d8j0ntlcm91z4.cloudfront.net/user_3EySHfd5WtGWSyMpbX7CTnKeTxH"
mkdir -p "$DEST"

# filename<TAB>source-url
while IFS=$'\t' read -r name url; do
  [ -z "$name" ] && continue
  echo "↓ $name"
  curl -fsSL "$BASE/$url" -o "$DEST/$name"
done <<'EOF'
_compound-snap-8-cutout.png	hf_20260612_221605_d2a1c12f-d64e-47c1-9c08-ec3f55cd38d3.png
_compound-retatrutide-cutout.png	hf_20260612_222032_d5c0692e-f46a-406e-b564-5a7990fb271c.png
_compound-tirzepatide-cutout.png	hf_20260612_222034_9092fa2e-2473-412e-a848-638c3e8a69be.png
_compound-semaglutide-cutout.png	hf_20260612_222038_3a604b05-0e42-46c3-9c3e-bcbe1a5adeac.png
_compound-bpc-157-cutout.png	hf_20260612_222040_c5c170ec-9deb-47d4-a85a-e94169eeca31.png
_compound-ghk-cu-cutout.png	hf_20260612_222115_bab2fe3f-2bbf-4762-94ce-1f689e3fe433.png
_compound-klow-cutout.png	hf_20260612_222118_40f82213-fa2c-45c8-870f-eaec21cc671f.png
_compound-bac-water-cutout.png	hf_20260612_222121_c35ed395-2930-4ad8-bada-7145bb65237a.png
_compound-cjc-1295-ipamorelin-cutout.png	hf_20260612_222124_a7f527d9-2541-48af-be64-3233ac52f12c.png
_compound-tb-500-cutout.png	hf_20260612_222203_b6a3f7fe-6e83-455c-95ac-0f119bd49d46.png
_compound-bpc-157-tb-500-blend-cutout.png	hf_20260612_222206_ba8219f0-6a20-4fdd-9c03-ddacd98b41e3.png
_compound-ipamorelin-cutout.png	hf_20260612_222209_131869c5-7415-4e5f-9da6-aa6e3a984ab2.png
_compound-cagrilintide-cutout.png	hf_20260612_222212_cec543da-aea0-4adf-97b4-f4c4ba2b007e.png
_compound-mazdutide-cutout.png	hf_20260612_222259_562440d7-759b-444e-8c50-b9be4967e242.png
_compound-aod-9604-cutout.png	hf_20260612_222301_71f450a3-6116-4b39-8285-885247adf47d.png
_compound-cjc-1295-without-dac-cutout.png	hf_20260612_222304_cda095ff-c584-41e7-b1cc-6f9a8ec5fc23.png
_compound-tesamorelin-cutout.png	hf_20260612_222306_5d50f07a-e921-49f0-a0cd-fe5d3fa13207.png
_compound-sermorelin-cutout.png	hf_20260612_222325_dc8d91c9-11b0-42a7-9e09-7fa61ace94c9.png
_compound-mots-c-cutout.png	hf_20260612_222330_627f5fa8-de95-46ac-85fe-2dad453b25e3.png
_compound-igf-1-lr3-cutout.png	hf_20260612_222333_f2f4ede3-7cc5-4732-8915-ad1b9f76480d.png
_compound-arachidonic-acid-cutout.png	hf_20260612_222337_ce0e2113-77cd-431d-a3a1-f7bfc6aa318c.png
_compound-glow-cutout.png	hf_20260612_222357_9b46387a-e778-4878-879a-73dbe0068836.png
_compound-melanotan-i-cutout.png	hf_20260612_222401_8b57520a-09cb-4d63-ac12-ca9ad40cc16e.png
_compound-melanotan-ii-cutout.png	hf_20260612_222405_0c89fbab-59e7-4ac5-b1e4-ddf9971f1e39.png
_compound-pt-141-cutout.png	hf_20260612_222407_b8bcb635-6407-44c2-91db-94cdaa1032e3.png
_compound-nad-cutout.png	hf_20260612_222436_6f76b9a4-3984-4c2a-ac53-36a422647a34.png
_compound-glutathione-cutout.png	hf_20260612_222440_0b30063d-5201-4970-9646-46f34ec91b8d.png
_compound-semax-cutout.png	hf_20260612_222443_3a862772-2cc1-4715-8122-3e0015bc72ea.png
_compound-selank-cutout.png	hf_20260612_222445_b3d7c61a-46d5-4191-bcae-cefb807e84b9.png
_compound-semax-selank-cutout.png	hf_20260612_222508_fa8ffe1c-0635-4f2d-a11c-3ba9a55065db.png
_compound-epitalon-cutout.png	hf_20260612_222510_e5bce15f-6440-493c-a3f7-d9962f3b824d.png
_compound-ss-31-cutout.png	hf_20260612_222513_a58bd6d5-7a0f-407d-a32b-03ed27f725db.png
_compound-slu-pp-332-cutout.png	hf_20260612_222516_ccf81159-6479-4ce7-995c-6e31695ec5b8.png
_compound-5-amino-1mq-cutout.png	hf_20260612_222536_f2b2cdf3-b71c-41c4-a679-e52f7a346491.png
_compound-thymosin-alpha-1-cutout.png	hf_20260612_222539_3b26bb97-dd76-48d7-86dd-6da3dd1fc3c7.png
_compound-kpv-peptide-cutout.png	hf_20260612_222541_483e6cd1-1ec0-45ca-a7dc-590b14d74ffa.png
_compound-ara-290-cutout.png	hf_20260612_222608_594b94ad-6828-4621-a481-2375c4d2b1df.png
_compound-dsip-cutout.png	hf_20260612_222611_dcfb7014-d23e-4ad9-8a66-6c89c3088e91.png
_compound-lemon-bottle-cutout.png	hf_20260612_222614_b9b7eaf6-a989-4ea3-85d0-3ffff94e09f4.png
EOF

echo "Done. $(ls "$DEST"/_compound-*-cutout.png | wc -l) cutouts present (expect 39)."
