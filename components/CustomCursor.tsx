'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry/i.test(navigator.userAgent) ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (isMobile || !supportsHover || prefersReducedMotion) return;

    document.body.style.cursor = 'none';

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseLeave = () => {
      cursorRef.current?.classList.add('cursor--hidden');
    };

    const onMouseEnter = () => {
      cursorRef.current?.classList.remove('cursor--hidden');
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    const applyCursorListeners = () => {
      const elements = document.querySelectorAll('[data-cursor]');
      elements.forEach((el) => {
        const type = el.getAttribute('data-cursor');
        const handleEnter = () => {
          if (cursorRef.current) {
            cursorRef.current.className = `cursor cursor--${type}`;
          }
        };
        const handleLeave = () => {
          if (cursorRef.current) {
            cursorRef.current.className = 'cursor';
          }
        };

        el.addEventListener('mouseenter', handleEnter);
        el.addEventListener('mouseleave', handleLeave);
      });
    };

    applyCursorListeners();
    const observer = new MutationObserver(() => {
      applyCursorListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const tick = () => {
      dotX += (mouseX - dotX) * 0.15;
      dotY += (mouseY - dotY) * 0.15;
      ringX += (mouseX - ringX) * 0.08;
      ringY += (mouseY - ringY) * 0.08;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="cursor" id="cursor" ref={cursorRef} aria-hidden="true">
      <div className="cursor__dot" ref={dotRef}></div>
      <div className="cursor__ring" ref={ringRef}></div>
    </div>
  );
}
