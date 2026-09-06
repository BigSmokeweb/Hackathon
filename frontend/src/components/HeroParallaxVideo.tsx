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

    // Direct CSS transform and opacity update for 60/120fps hardware acceleration
    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!container || !video) return;

        const rect = container.getBoundingClientRect();
        const height = rect.height || window.innerHeight;

        // Calculate scroll progress through the hero section: 0 (top) -> 1 (scrolled past)
        const progress = Math.min(1, Math.max(0, -rect.top / height));

        // Scale from 1.0 to 1.15
        const scale = 1.0 + progress * 0.15;
        // Fade out from 1.0 to 0.0
        const opacity = Math.max(0, 1.0 - progress * 1.1);

        video.style.transform = `scale(${scale.toFixed(4)}) translateZ(0)`;
        video.style.opacity = `${opacity.toFixed(4)}`;
      });
    };

    // IntersectionObserver with 101 thresholds for granular visibility tracking
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          // Play video when visible and bind scroll listener for smooth cinematic pull
          if (video.paused) {
            video.play().catch(() => {});
          }

          if (!isObserving) {
            isObserving = true;
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
          }

          // Fallback direct update based on intersection ratio
          const progress = Math.min(1, Math.max(0, 1 - entry.intersectionRatio));
          const scale = 1.0 + progress * 0.15;
          const opacity = Math.max(0, entry.intersectionRatio);

          video.style.transform = `scale(${scale.toFixed(4)}) translateZ(0)`;
          video.style.opacity = `${opacity.toFixed(4)}`;
        } else {
          // Hero out of view: pause video and remove scroll listener to save CPU/GPU
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
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    observer.observe(container);

    // Initial calculation
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
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover object-center will-change-transform transition-[transform,opacity] duration-75 ease-out"
        style={{
          transform: 'scale(1.0) translateZ(0)',
          opacity: 1,
        }}
      >
        <source src="/hero-bg-2.mp4" type="video/mp4" />
      </video>
      {/* Subtle cinematic gradient overlays that fade into Warm Parchment #F5F1E6 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-[#F5F1E6] pointer-events-none" />
    </div>
  );
}

export default HeroParallaxVideo;
