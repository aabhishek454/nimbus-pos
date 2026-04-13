/**
 * Haptic feedback utility for futuristic tactile feels
 */
export const haptics = {
  /**
   * Subtle tap for item selection or button press
   */
  light: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  },

  /**
   * More pronounced tap for secondary actions
   */
  medium: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  },

  /**
   * Success pattern: light -> pause -> light
   */
  success: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([20, 10, 20]);
    }
  },

  /**
   * Error pattern: medium -> pause -> medium -> pause -> medium
   */
  error: () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([30, 20, 30, 20, 30]);
    }
  },
};
