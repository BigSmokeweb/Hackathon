'use client';

import { useEffect, useRef } from 'react';

export function HeroParallaxVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    let rafId: number | null = null;
    let isObserving = false;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!container || !video) return;

        const rect = container.getBoundingClientRect();
        const height = rect.height || window.innerHeight;

        // Progress: 0 at top of hero, 1 when scrolled completely past hero
        const progress = Math.min(1, Math.max(0, -rect.top / height));

        // Subtle scale (1.0 -> 1.08)
        const scale = 1.0 + progress * 0.08;

        // Opacity smoothly fades only when scrolling down into page 2
        const opacity = Math.max(0, 1.0 - progress * 1.05);

        video.style.transform = `scale(${scale.toFixed(4)}) translateZ(0)`;
        video.style.opacity = `${opacity.toFixed(4)}`;
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
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
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

      {/* Subtle top header gradient solely for navbar contrast */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />

      {/* ─── Seamless Feathered Blend into 2nd Page (Exact Match to Screenshot) ─── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            transparent 0%,
            transparent 50%,
            rgba(245, 241, 230, 0.08) 62%,
            rgba(245, 241, 230, 0.32) 74%,
            rgba(245, 241, 230, 0.70) 86%,
            rgba(245, 241, 230, 0.94) 95%,
            #F5F1E6 100%
          )`,
        }}
      />
    </div>
  );
}

export default HeroParallaxVideo;
