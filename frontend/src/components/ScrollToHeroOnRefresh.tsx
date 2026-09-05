'use client';

import { useEffect } from 'react';

export function ScrollToHeroOnRefresh() {
  useEffect(() => {
    try {
      // Force manual scroll restoration so browsers do not remember scroll position on refresh
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }

      // Clear section anchor hashes on refresh so browser stays on Hero section
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      // Immediate scroll to top hero
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // Before page unloads on F5/refresh, reset scroll offset to 0
      const onBeforeUnload = () => {
        window.scrollTo(0, 0);
      };
      window.addEventListener('beforeunload', onBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', onBeforeUnload);
      };
    } catch {
      // Fallback in case history API is restricted
    }
  }, []);

  return null;
}
