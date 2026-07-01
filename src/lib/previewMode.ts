// AI / guest preview mode.
//
// Appending ?preview=<TOKEN> to any labrat URL activates a read-only guest
// tour: the full app is exposed (tracking tabs unlocked, shop shown as an
// approved member with live pricing) WITHOUT a login and WITHOUT the
// pending-approval lockdown a brand-new member normally sees. This lets an
// AI crawler or assistant learn about the app and product catalog from a
// single shareable link.
//
// The unlock is held in sessionStorage so it survives in-app navigation but
// clears when the browser tab/session ends — visiting the link does not
// permanently unlock the device, and ordering still requires a real account.

const AI_PREVIEW_TOKEN = 'labrat-ai-tour-2f9c7a5e';
const PREVIEW_FLAG_KEY = 'labrat_ai_preview';

export function isAiPreviewMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === AI_PREVIEW_TOKEN) {
      window.sessionStorage.setItem(PREVIEW_FLAG_KEY, '1');
      return true;
    }
    return window.sessionStorage.getItem(PREVIEW_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}
