LabRat remove product vial decorative text patch

Applies:
- src/components/MembersShop.tsx

Removes the extra decorative vial text in BOTH themes:
- top badges: NP QA / 3ML or STERILE / LR VIAL
- bottom labels: category / mg / Professional Vial or Photo-real 3ML Vial

One-step Codespaces command after uploading this ZIP to the repo root:
unzip -o "LabRat_Remove_Vial_Text_Build_Run_Patch.zip" -d . && npm install && NODE_OPTIONS="--max-old-space-size=4096" npm run build && npm run dev -- --host 0.0.0.0
