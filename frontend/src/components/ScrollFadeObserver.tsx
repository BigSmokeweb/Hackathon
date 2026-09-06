'use client';

import { useEffect } from 'react';

export function ScrollFadeObserver() {
  useEffect(() => {
    // Exclude hero section, navbar, leaflet map, and horizontal carousels
    const isExcluded = (el: Element): boolean => {
      return Boolean(
        el.closest('#hero') ||
        el.closest('header') ||
        el.closest('.leaflet-container') ||
        el.closest('.leaflet-popup') ||
        el.closest('.overflow-x-auto') ||
        el.closest('.no-scrollbar')
      );
    };

    const registeredElements = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;

            // Check if this is a container with staggered children
            const children = Array.from(target.querySelectorAll<HTMLElement>('.fade-up-init'));
            if (children.length > 0) {
              children.forEach((child, index) => {
                child.style.transitionDelay = `${index * 80}ms`;
                child.classList.add('fade-up-in');
              });
            } else {
              target.classList.add('fade-up-in');
            }
          } else {
            // When scrolled out of viewport, reset so it replays upon re-entering
            const target = entry.target as HTMLElement;
            const children = Array.from(target.querySelectorAll<HTMLElement>('.fade-up-init'));
            if (children.length > 0) {
              children.forEach((child) => {
                child.style.transitionDelay = '0ms';
                child.classList.remove('fade-up-in');
              });
            } else {
              target.classList.remove('fade-up-in');
            }
          }
        });
      },
      {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const scanAndObserve = () => {
      // 1. Identify section headings, cards, and paragraphs
      const candidates = document.querySelectorAll(
        'section h1, section h2, section h3, section h4, article, section p, [data-fade-up]'
      );

      // Group sibling cards/items within grids for 80ms staggering
      const grids = document.querySelectorAll('.grid, [data-fade-stagger]');
      grids.forEach((grid) => {
        if (isExcluded(grid) || registeredElements.has(grid)) return;

        const items = Array.from(grid.children);
        if (items.length > 1) {
          items.forEach((item) => {
            if (!isExcluded(item) && !item.classList.contains('fade-up-init')) {
              item.classList.add('fade-up-init');
            }
          });
          registeredElements.add(grid);
          observer.observe(grid);
        }
      });

      // Individual headings, cards, paragraphs
      candidates.forEach((el) => {
        if (isExcluded(el) || registeredElements.has(el)) return;

        // If not already inside an observed grid, observe individually
        const parentGrid = el.closest('.grid, [data-fade-stagger]');
        if (!parentGrid || !registeredElements.has(parentGrid)) {
          if (!el.classList.contains('fade-up-init')) {
            el.classList.add('fade-up-init');
          }
          registeredElements.add(el);
          observer.observe(el);
        }
      });
    };

    // Initial scan
    scanAndObserve();

    // Re-scan when content dynamically loads or expands (debounced via rAF)
    let rafId: number | null = null;
    const mutationObserver = new MutationObserver(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        scanAndObserve();
        rafId = null;
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}

export default ScrollFadeObserver;
