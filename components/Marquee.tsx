'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Marquee() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (trackRef.current && sectionRef.current) {
      gsap.to(trackRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 3,
        },
        x: -80,
        ease: 'none',
      });
    }
  }, []);

  const items = [
    'Digital Platforms',
    'Enterprise Systems',
    'Scalable Architecture',
    'Automation',
    'Cloud Engineering',
    'Platform Design',
  ];

  return (
    <section
      className="marquee-section"
      id="marquee"
      ref={sectionRef}
      aria-hidden="true"
    >
      <div className="marquee__track" id="marquee-track" ref={trackRef}>
        {items.concat(items).map((item, index) => (
          <span key={index}>
            <span className="marquee__item">{item}</span>
            <span className="marquee__sep">&#9670;</span>
          </span>
        ))}
      </div>
    </section>
  );
}
