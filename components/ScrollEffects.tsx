'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScrollEffects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry/i.test(navigator.userAgent) ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    // Cinematic section reveals
    const sections = document.querySelectorAll('.section--cinematic');
    sections.forEach((section) => {
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          end: 'top 45%',
          scrub: 1.5,
        },
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        ease: 'none',
      });
    });

    // Reveal helper
    const reveal = (
      trigger: string,
      target: string,
      opts: { y?: number; duration?: number; delay?: number } = {}
    ) => {
      gsap.fromTo(
        target,
        { opacity: 0, y: opts.y || 16 },
        {
          scrollTrigger: {
            trigger,
            start: 'top 72%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          y: 0,
          duration: opts.duration || 1,
          delay: opts.delay || 0,
          ease: 'power2.out',
        }
      );
    };

    reveal('#about', '#about .section__label', { y: 12, duration: 0.9 });
    reveal('#about', '#about .section__title', {
      y: 18,
      duration: 1.2,
      delay: 0.1,
    });
    reveal('#about', '.about__text', { y: 20, duration: 1.1, delay: 0.2 });
    reveal('#about', '.founders', { y: 24, duration: 1.1, delay: 0.35 });

    reveal('#services', '#services .section__label', { y: 12, duration: 0.9 });
    reveal('#services', '#services .section__title', {
      y: 18,
      duration: 1.2,
      delay: 0.1,
    });
    reveal('#services', '#services .section__desc', {
      y: 14,
      duration: 1,
      delay: 0.15,
    });

    // Customer Journey
    gsap.fromTo(
      '#journey-steps',
      { opacity: 0, y: 20 },
      {
        scrollTrigger: {
          trigger: '#journey-steps',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power2.out',
      }
    );

    // Pricing Table
    gsap.fromTo(
      '#packages-table',
      { opacity: 0, y: 24 },
      {
        scrollTrigger: {
          trigger: '#packages-table',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay: 0.1,
        ease: 'power3.out',
      }
    );

    // Addons section
    reveal('#services-addons', '#addons-title', { y: 16, duration: 1 });
    reveal('#services-addons', '#addons-desc', {
      y: 14,
      duration: 1,
      delay: 0.1,
    });
    gsap.fromTo(
      '#addons-grid',
      { opacity: 0, y: 20 },
      {
        scrollTrigger: {
          trigger: '#addons-grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        duration: 1.1,
        delay: 0.15,
        ease: 'power2.out',
      }
    );

    // Free Support banner
    gsap.fromTo(
      '.free-support__card',
      { opacity: 0, y: 20, scale: 0.98 },
      {
        scrollTrigger: {
          trigger: '#free-support',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: 'power3.out',
      }
    );

    // Support Plans
    reveal('#support-plans', '#support-plans-title', { y: 16, duration: 1 });
    reveal('#support-plans', '#support-plans-desc', {
      y: 14,
      duration: 1,
      delay: 0.1,
    });

    const supportCards = document.querySelectorAll('.support-card');
    supportCards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 24 },
        {
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          y: 0,
          duration: 1.1,
          delay: i * 0.12,
          ease: 'power3.out',
        }
      );
    });

    // Projects
    reveal('#services-projects', '#projects-title', { y: 16, duration: 1 });
    reveal('#services-projects', '#projects-desc', {
      y: 14,
      duration: 1,
      delay: 0.1,
    });

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 30, scale: 0.98 },
        {
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          delay: (i % 2) * 0.12,
          ease: 'power3.out',
        }
      );
    });

    reveal('#experience', '#exp-label', { y: 12, duration: 0.9 });
    reveal('#experience', '#exp-title', { y: 18, duration: 1.2, delay: 0.1 });

    reveal('#contact', '#contact .section__label', { y: 12, duration: 0.9 });
    reveal('#contact', '#contact .section__title', {
      y: 18,
      duration: 1.2,
      delay: 0.1,
    });
    reveal('#contact', '#contact .section__desc', {
      y: 14,
      duration: 1,
      delay: 0.2,
    });
    reveal('#contact', '.contact__actions', { y: 16, duration: 1, delay: 0.3 });

    // Parallax mousemove on .parallax-layer
    if (!isMobile) {
      const layers = document.querySelectorAll<HTMLElement>('.parallax-layer');
      const onParallaxMove = (e: MouseEvent) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const mx = (e.clientX - cx) / cx;
        const my = (e.clientY - cy) / cy;
        layers.forEach((layer) => {
          const d = parseFloat(layer.getAttribute('data-depth') || '0.1');
          gsap.to(layer, {
            x: mx * d * 30,
            y: my * d * 20,
            duration: 1.2,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      };
      document.addEventListener('mousemove', onParallaxMove, {
        passive: true,
      });

      return () => {
        document.removeEventListener('mousemove', onParallaxMove);
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Smooth scroll handler for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      e.preventDefault();
      if (href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const element = document.querySelector(href);
      if (element) {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - 80,
          behavior: 'smooth',
        });
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return null;
}
