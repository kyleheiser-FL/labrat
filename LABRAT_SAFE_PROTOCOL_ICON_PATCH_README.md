# LABRAT safe protocol icon patch

This patch is intentionally safe:
- It does not edit CyclePlanner.tsx.
- It does not change protectant/preset active-state logic.
- It only adds local protocol SVG graphics and a fallback module that swaps broken protocol images to local assets.

After applying, Vercel should redeploy automatically from GitHub.
