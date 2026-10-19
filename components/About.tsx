'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Founder {
  id: string;
  name: string;
  role: string;
  badge: string;
  image: string;
  quote: string;
}

const founders: Founder[] = [
  {
    id: 'founder-1',
    name: 'K.KARTHIK KUMAR',
    role: 'Founder & CEO',
    badge: 'Founder',
    image: '/founder_karthik.jpg',
    quote:
      'Innovation isn\'t just about the technology we build; it\'s about the robust foundation we lay. We architect digital infrastructures that empower enterprises to scale seamlessly and thrive.',
  },
  {
    id: 'founder-2',
    name: 'P.VAMSHI KRISHNA',
    role: 'CO-FOUNDER & CFO',
    badge: 'Co-Founder',
    image: '/founder_vamshi_2.jpg',
    quote:
      'True scale emerges when visionary engineering meets financial prudence. We are committed to fueling sustainable growth by transforming complex operational challenges into competitive advantages.',
  },
  {
    id: 'founder-3',
    name: 'CH.SAI HARSHITH GOUD',
    role: 'Co-Founder & COO',
    badge: 'Co-Founder',
    image: '/founder_cto_real.png',
    quote:
      'The most potent technology is one that feels effortless. We specialize in bridging the gap between profound technical complexity and intuitive, transformative experiences that resonate globally.',
  },
  {
    id: 'founder-4',
    name: 'B. AKHIL',
    role: 'UI & UX DESIGNER',
    badge: 'Design Lead',
    image: '/Akhil.png',
    quote:
      'Good design is about making complex systems feel simple and intuitive. We craft digital experiences that users naturally understand.',
  },
  {
    id: 'founder-5',
    name: 'T. NAGA SHIVA HARSHITHA',
    role: 'Technology & Innovation',
    badge: 'Innovation Lead',
    image: '/harshitha.png',
    quote:
      'Innovation is the engine of progress. We push the boundaries of what\'s possible, turning emerging technologies into real-world solutions that redefine industries.',
  },
];

export default function About() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // When the section first comes into view, ensure it starts from CEO (index 0)
            if (!hasTriggeredRef.current) {
              setCurrent(0);
              hasTriggeredRef.current = true;
            }
            setIsInView(true);
          } else {
            setIsInView(false);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // Only cycle when the About section is actively in view and not paused
    if (!isInView || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % founders.length);
    }, 4000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isInView, isPaused]);

  const handleDotClick = (index: number) => {
    setCurrent(index);
  };

  return (
    <section className="section about section--cinematic" id="about" ref={sectionRef}>
      <div className="container">
        <div className="about__layout">
          {/* Left: header + description */}
          <div className="about__left">
            <span className="section__label" id="about-label">
              01 — About
            </span>
            <h2
              className="section__title parallax-layer"
              data-depth="0.06"
              id="about-title"
            >
              We don&apos;t just build software.
              <br />
              We engineer platforms.
            </h2>
            <div className="about__text" id="about-text">
              <p>
                VASHIK is a focused engineering company that designs and builds
                digital platforms for enterprises that demand reliability, scale,
                and precision. We work with organizations that understand
                technology is infrastructure — not decoration.
              </p>
              <p>
                Our team brings deep expertise in distributed systems, cloud
                architecture, and platform engineering. We build what matters
                and build it to last.
              </p>
            </div>
          </div>

          {/* Right: founders carousel */}
          <div
            className="founders"
            id="founders"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="founders__track" id="founders-track">
              {founders.map((founder, index) => {
                const isActive = index === current;
                return (
                  <div
                    key={founder.id}
                    className={`founder-card ${isActive ? 'is-active' : ''}`}
                    id={founder.id}
                  >
                    <div className="founder-card__image-wrap">
                      <Image
                        src={founder.image}
                        alt={`${founder.name} — ${founder.role}`}
                        width={400}
                        height={500}
                        className="founder-card__image"
                        priority={index === 0}
                      />
                      <span className="founder-card__badge">
                        {founder.badge}
                      </span>
                    </div>
                    <div className="founder-card__body">
                      <div className="founder-card__meta">
                        <span className="founder-card__name">
                          {founder.name}
                        </span>
                        <span className="founder-card__role">
                          {founder.role}
                        </span>
                      </div>
                      <blockquote className="founder-card__quote">
                        &ldquo;{founder.quote}&rdquo;
                      </blockquote>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots navigation */}
            <div className="founders__dots" id="founders-dots">
              {founders.map((founder, index) => (
                <button
                  key={founder.id}
                  className={`founders__dot ${
                    index === current ? 'is-active' : ''
                  }`}
                  onClick={() => handleDotClick(index)}
                  aria-label={`${founder.name} - slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
