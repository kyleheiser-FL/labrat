/**
 * Device Haptic Feedback (Vibration API) Utility
 * Supports tactile touch configurations for Android/PWA web applications.
 */
export const triggerHaptic = (style: 'light' | 'medium' | 'success' | 'warning' | 'heavy') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (style) {
        case 'light':
          navigator.vibrate(12);
          break;
        case 'medium':
          navigator.vibrate(30);
          break;
        case 'success':
          // double pulse
          navigator.vibrate([20, 40, 25]);
          break;
        case 'warning':
          // triplet pulse
          navigator.vibrate([60, 40, 40, 40, 60]);
          break;
        case 'heavy':
          navigator.vibrate(90);
          break;
      }
    } catch (e) {
      console.warn('Physical haptic vibration failed or blocked', e);
    }
  }
};
