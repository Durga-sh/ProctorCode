import { useEffect, useRef, useCallback, useState } from 'react';

const MAX_VIOLATIONS = 3;

/**
 * useProctoring — enforces exam integrity:
 *  - Fullscreen: enters on mount, re-enters on escape/exit
 *  - Tab switch / window blur: detected and counted
 *  - Right-click disabled
 *  - Common keyboard shortcuts (F12, Ctrl+Shift+I, Alt+Tab, etc.) blocked
 *
 * @param {boolean} active   - only runs when the exam is active
 * @param {Function} onForceSubmit - called when violations exceed MAX_VIOLATIONS
 * @returns {{ violations, isFullscreen, warningVisible, dismissWarning, enterFullscreen }}
 */
export function useProctoring(active, onForceSubmit) {
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const violationsRef = useRef(0);
  const onForceSubmitRef = useRef(onForceSubmit);
  onForceSubmitRef.current = onForceSubmit;

  /* ── Helpers ── */
  const triggerViolation = useCallback((message) => {
    violationsRef.current += 1;
    setViolations(violationsRef.current);
    setWarningMessage(message);
    setWarningVisible(true);

    if (violationsRef.current >= MAX_VIOLATIONS) {
      onForceSubmitRef.current?.();
    }
  }, []);

  const dismissWarning = useCallback(() => {
    setWarningVisible(false);
    // Re-enter fullscreen after dismissing the warning
    enterFullscreen();
  }, []);

  /* ── Fullscreen ── */
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  }, []);

  const handleFullscreenChange = useCallback(() => {
    const inFS =
      !!document.fullscreenElement ||
      !!document.webkitFullscreenElement ||
      !!document.mozFullScreenElement;
    setIsFullscreen(inFS);

    if (!inFS && active) {
      triggerViolation('⛔ You exited fullscreen mode. Please stay in fullscreen during the exam.');
    }
  }, [active, triggerViolation]);

  /* ── Tab / Window switch ── */
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && active) {
      triggerViolation('⚠️ Tab switch detected! Switching tabs during an exam is not allowed.');
    }
  }, [active, triggerViolation]);

  const handleBlur = useCallback(() => {
    if (active) {
      triggerViolation('⚠️ Window focus lost! Please stay on the exam window.');
    }
  }, [active, triggerViolation]);

  /* ── Keyboard shortcuts ── */
  const handleKeyDown = useCallback((e) => {
    if (!active) return;
    const blocked =
      e.key === 'F12' ||                                    // DevTools
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) || // DevTools
      (e.ctrlKey && e.key === 'u') ||                       // View source
      (e.altKey && e.key === 'Tab') ||                      // Alt+Tab (some browsers)
      (e.metaKey && e.key === 'Tab') ||                     // Cmd+Tab (Mac)
      e.key === 'F5' ||                                     // Refresh
      (e.ctrlKey && e.key === 'r');                         // Ctrl+R Refresh

    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [active]);

  /* ── Right-click ── */
  const handleContextMenu = useCallback((e) => {
    if (active) e.preventDefault();
  }, [active]);

  /* ── Mount / Unmount effects ── */
  useEffect(() => {
    if (!active) return;

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);

      // Exit fullscreen when leaving exam
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    };
  }, [active, handleFullscreenChange, handleVisibilityChange, handleBlur, handleKeyDown, handleContextMenu]);

  return {
    violations,
    maxViolations: MAX_VIOLATIONS,
    isFullscreen,
    warningVisible,
    warningMessage,
    dismissWarning,
    enterFullscreen,
  };
}
