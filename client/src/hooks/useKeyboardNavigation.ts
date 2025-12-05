import { useEffect, useCallback } from 'react';

export type NavigationKey = 'next' | 'prev' | 'fullscreen' | 'escape';

interface UseKeyboardNavigationProps {
  onNext?: () => void;
  onPrev?: () => void;
  onFullscreen?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

const NEXT_PAGE_KEYS = ['ArrowRight', 'PageDown', ' ', 'Enter'];
const PREV_PAGE_KEYS = ['ArrowLeft', 'PageUp', 'Backspace'];
const FULLSCREEN_KEYS = ['F11', 'f'];
const ESCAPE_KEYS = ['Escape'];

export const useKeyboardNavigation = ({
  onNext,
  onPrev,
  onFullscreen,
  onEscape,
  enabled = true,
}: UseKeyboardNavigationProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Verhindere Standard-Verhalten für bestimmte Keys
      if ([...NEXT_PAGE_KEYS, ...PREV_PAGE_KEYS, ...FULLSCREEN_KEYS].includes(event.key)) {
        event.preventDefault();
      }

      // Next
      if (NEXT_PAGE_KEYS.includes(event.key) && onNext) {
        onNext();
      }
      // Prev
      else if (PREV_PAGE_KEYS.includes(event.key) && onPrev) {
        onPrev();
      }
      // Fullscreen
      else if (FULLSCREEN_KEYS.includes(event.key) && onFullscreen) {
        onFullscreen();
      }
      // Escape
      else if (ESCAPE_KEYS.includes(event.key) && onEscape) {
        onEscape();
      }
    },
    [enabled, onNext, onPrev, onFullscreen, onEscape]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
};
