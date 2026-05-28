# LABRAT protocol graphics wired patch

This patch adds the missing protocol icon graphics in multiple production-safe static paths, plus a reusable React component:

- `/protocol-icons/*`
- `/assets/protocol-icons/*`
- `/icons/protocols/*`
- `/images/protocols/*`
- `src/assets/protocol-icons/*`
- `src/components/ProtocolIcon.tsx`

After applying, Vercel should redeploy from GitHub.

If the live app still shows broken images, run this once from the repo root:

```bash
node scripts/apply-protocol-icons.cjs
git add .
git commit -m "Wire LabRat protocol graphics into CyclePlanner" || true
git push
```

Then hard refresh the PWA / clear the service worker cache.
