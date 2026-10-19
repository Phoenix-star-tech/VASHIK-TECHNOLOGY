'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Approach() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const pillars = sectionRef.current?.querySelectorAll<HTMLElement>('.pillar');
    pillars?.forEach((pillar, i) => {
      gsap.fromTo(
        pillar,
        { opacity: 0, x: -20 },
        {
          scrollTrigger: {
            trigger: pillar,
            start: 'top 82%',
            toggleActions: 'play none none none',
            onEnter: () => pillar.classList.add('is-active'),
          },
          opacity: 1,
          x: 0,
          duration: 1.2,
          delay: i * 0.2,
          ease: 'power3.out',
        }
      );
    });

    const isMobile =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry/i.test(navigator.userAgent) ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (!isMobile && sectionRef.current) {
      [
        { el: '#px-shape-1', y: -40 },
        { el: '#px-shape-2', y: -60 },
        { el: '#px-shape-3', y: -30 },
        { el: '#px-shape-4', y: -50 },
      ].forEach((s) => {
        const el = sectionRef.current?.querySelector(s.el);
        if (el) {
          gsap.to(el, {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 3,
            },
            y: s.y,
            ease: 'none',
          });
        }
      });
    }
  }, []);

  return (
    <section
      className="section experience section--cinematic"
      id="experience"
      ref={sectionRef}
    >
      <div className="container">
        <div className="section__header">
          <span className="section__label" id="exp-label">
            03 — Approach
          </span>
          <h2
            className="section__title parallax-layer"
            data-depth="0.06"
            id="exp-title"
          >
            Precision. At every layer.
          </h2>
        </div>
        <div className="experience__track" id="experience-track">
          <div className="pillar" id="pillar-1">
            <div className="pillar__line"></div>
            <div className="pillar__content">
              <span className="pillar__number">01</span>
              <h3 className="pillar__title">Discovery &amp; Architecture</h3>
              <p className="pillar__text">
                We start by understanding the problem deeply — mapping domains,
                defining boundaries, and designing systems before writing a
                single line of code.
              </p>
            </div>
          </div>
          <div className="pillar" id="pillar-2">
            <div className="pillar__line"></div>
            <div className="pillar__content">
              <span className="pillar__number">02</span>
              <h3 className="pillar__title">Engineering &amp; Iteration</h3>
              <p className="pillar__text">
                Our engineering process is disciplined and iterative. We build in
                small, testable increments with continuous integration and
                real-time feedback loops.
              </p>
            </div>
          </div>
          <div className="pillar" id="pillar-3">
            <div className="pillar__line"></div>
            <div className="pillar__content">
              <span className="pillar__number">03</span>
              <h3 className="pillar__title">Delivery &amp; Scale</h3>
              <p className="pillar__text">
                We deliver production-ready platforms with monitoring,
                observability, and scaling strategies built in — not bolted on.
              </p>
            </div>
          </div>
        </div>
        <div className="experience__parallax" aria-hidden="true">
          <div className="parallax-shape shape--1" id="px-shape-1"></div>
          <div className="parallax-shape shape--2" id="px-shape-2"></div>
          <div className="parallax-shape shape--3" id="px-shape-3"></div>
          <div className="parallax-shape shape--4" id="px-shape-4"></div>
        </div>
      </div>
    </section>
  );
}
