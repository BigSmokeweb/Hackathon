'use client';

import { useEffect, useRef } from 'react';

export function HeroParallaxVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blendRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    let rafId: number | null = null;
    let isObserving = false;

    // Smooth scroll handler: keeps hero video crystal clear at top and blends only as you scroll to second page
    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!container || !video) return;

        const rect = container.getBoundingClientRect();
        const height = rect.height || window.innerHeight;

        // Progress: 0 at top of hero, 1 when scrolled completely past hero
        const progress = Math.min(1, Math.max(0, -rect.top / height));

        // Subtle scale effect on scroll
        const scale = 1.0 + progress * 0.08;

        // Keep video crystal clear (opacity 1.0) while in view, only fading as we scroll down to page 2
        const videoOpacity = progress < 0.2 ? 1 : Math.max(0, 1 - (progress - 0.2) / 0.8);

        video.style.transform = `scale(${scale.toFixed(4)}) translateZ(0)`;
        video.style.opacity = `${videoOpacity.toFixed(4)}`;

        // Dynamic Blend: 0 at top (100% clear), fades in only as we scroll towards Section 2
        if (blendRef.current) {
          const blendOpacity = Math.min(1, Math.max(0, (progress - 0.05) / 0.85));
          blendRef.current.style.opacity = `${blendOpacity.toFixed(4)}`;
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          if (video.paused) {
            video.play().catch(() => {});
          }
          if (!isObserving) {
            isObserving = true;
            window.addEventListener('scroll', handleScroll, { passive: true });
          }
          handleScroll();
        } else {
          if (isObserving) {
            isObserving = false;
            window.removeEventListener('scroll', handleScroll);
          }
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          if (!video.paused) {
            video.pause();
          }
        }
      },
      {
        root: null,
        threshold: [0, 0.2, 0.5, 0.8, 1.0],
      }
    );

    observer.observe(container);
    handleScroll();

    return () => {
      observer.disconnect();
      if (isObserving) {
        window.removeEventListener('scroll', handleScroll);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Crystal Clear Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover object-center will-change-transform"
        style={{
          transform: 'scale(1.0) translateZ(0)',
          opacity: 1,
        }}
      >
        <source src="/hero-bg-2.mp4" type="video/mp4" />
      </video>

      {/* Gentle top gradient for top navbar legibility */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

      {/* Dynamic Scroll Blend: 0% opacity at top (crystal clear), only blends into #F5F1E6 as we scroll down to Section 2 */}
      <div
        ref={blendRef}
        className="absolute inset-0 pointer-events-none will-change-[opacity]"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(245, 241, 230, 0.25) 35%, rgba(245, 241, 230, 0.85) 75%, #F5F1E6 100%)',
          opacity: 0,
        }}
      />
    </div>
  );
}

export default HeroParallaxVideo;
