import { useState, useEffect, useCallback } from 'react';

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen-Fehler:', error);
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await toggleFullscreen();
    }
  }, [toggleFullscreen]);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await toggleFullscreen();
    }
  }, [toggleFullscreen]);

  return {
    isFullscreen,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
  };
};
