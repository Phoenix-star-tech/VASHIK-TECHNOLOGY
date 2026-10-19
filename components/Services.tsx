'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type TierKey = 'silver' | 'gold' | 'platinum';

interface FeatureItem {
  label: string;
  val: string;
  type: 'check' | 'dash' | 'optional' | 'highlight' | 'text' | 'price';
}

interface FeatureSection {
  title: string;
  items: FeatureItem[];
}

interface TierData {
  key: TierKey;
  name: string;
  icon: string;
  popular: boolean;
  price: string;
  bestFor: string;
  ctaText: string;
  ctaClass: string;
  tagline: string;
  highlights: string[];
  sections: FeatureSection[];
}

const TIERS_DATA: Record<TierKey, TierData> = {
  silver: {
    key: 'silver',
    name: 'Silver',
    icon: '🥈',
    popular: false,
    price: '₹7,999 – ₹12,999',
    bestFor: 'Small businesses & startups',
    ctaText: 'Choose Silver Package →',
    ctaClass: 'btn btn--ghost',
    tagline: 'Clean essential foundation to launch your brand online with professional trust and full responsiveness.',
    highlights: ['3–5 Pages', 'Responsive Design', '1 Month Free Support', '2 Revisions'],
    sections: [
      {
        title: 'Core & Design',
        items: [
          { label: 'Pages', val: '3–5 Pages', type: 'text' },
          { label: 'Responsive design', val: 'Included', type: 'check' },
          { label: 'Custom UI design', val: 'Basic', type: 'text' },
          { label: 'Contact / Enquiry form', val: 'Included', type: 'check' },
          { label: 'Animation / interactions', val: 'Basic', type: 'text' },
        ],
      },
      {
        title: 'Reach & Integrations',
        items: [
          { label: 'WhatsApp integration', val: 'Included', type: 'check' },
          { label: 'Google Maps', val: 'Included', type: 'check' },
          { label: 'Social media links', val: 'Included', type: 'check' },
          { label: 'Basic SEO', val: 'Not included', type: 'dash' },
          { label: 'Search Console setup', val: 'Not included', type: 'dash' },
          { label: 'Analytics setup', val: 'Not included', type: 'dash' },
        ],
      },
      {
        title: 'Tech & Performance',
        items: [
          { label: 'Speed optimization', val: 'Basic', type: 'text' },
          { label: 'Security / SSL setup', val: 'Included', type: 'check' },
          { label: 'Blog / News section', val: 'Not included', type: 'dash' },
          { label: 'Admin panel / CMS', val: 'Not included', type: 'dash' },
          { label: 'Database', val: 'Not included', type: 'dash' },
          { label: 'Payment integration', val: 'Not included', type: 'dash' },
        ],
      },
      {
        title: 'Support & Terms',
        items: [
          { label: 'Post-delivery support', val: '1 Month Free', type: 'highlight' },
          { label: 'Revisions', val: '2 Rounds', type: 'text' },
          { label: 'Project Price', val: '₹7,999 – ₹12,999', type: 'price' },
        ],
      },
    ],
  },
  gold: {
    key: 'gold',
    name: 'Gold',
    icon: '🥇',
    popular: true,
    price: '₹17,999 – ₹29,999',
    bestFor: 'Growing businesses & brands',
    ctaText: 'Choose Gold Package →',
    ctaClass: 'btn btn--primary',
    tagline: 'Most Popular: Complete high-impact website with advanced SEO, analytics, blog & dynamic interactions.',
    highlights: ['5–8 Pages', 'Advanced SEO Included', 'Speed Optimized', '4 Revisions'],
    sections: [
      {
        title: 'Core & Design',
        items: [
          { label: 'Pages', val: '5–8 Pages', type: 'text' },
          { label: 'Responsive design', val: 'Included', type: 'check' },
          { label: 'Custom UI design', val: 'Advanced', type: 'text' },
          { label: 'Contact / Enquiry form', val: 'Included', type: 'check' },
          { label: 'Animation / interactions', val: 'Medium', type: 'text' },
        ],
      },
      {
        title: 'Reach & Integrations',
        items: [
          { label: 'WhatsApp integration', val: 'Included', type: 'check' },
          { label: 'Google Maps', val: 'Included', type: 'check' },
          { label: 'Social media links', val: 'Included', type: 'check' },
          { label: 'Basic SEO', val: 'Included', type: 'check' },
          { label: 'Search Console setup', val: 'Included', type: 'check' },
          { label: 'Analytics setup', val: 'Included', type: 'check' },
        ],
      },
      {
        title: 'Tech & Performance',
        items: [
          { label: 'Speed optimization', val: 'Included', type: 'check' },
          { label: 'Security / SSL setup', val: 'Included', type: 'check' },
          { label: 'Blog / News section', val: 'Included', type: 'check' },
          { label: 'Admin panel / CMS', val: 'Optional', type: 'optional' },
          { label: 'Database', val: 'Optional', type: 'optional' },
          { label: 'Payment integration', val: 'Optional', type: 'optional' },
        ],
      },
      {
        title: 'Support & Terms',
        items: [
          { label: 'Post-delivery support', val: '1 Month Free', type: 'highlight' },
          { label: 'Revisions', val: '4 Rounds', type: 'text' },
          { label: 'Project Price', val: '₹17,999 – ₹29,999', type: 'price' },
        ],
      },
    ],
  },
  platinum: {
    key: 'platinum',
    name: 'Platinum',
    icon: '💎',
    popular: false,
    price: '₹39,999 – ₹69,999+',
    bestFor: 'Professional / large enterprises',
    ctaText: 'Choose Platinum Package →',
    ctaClass: 'btn btn--ghost',
    tagline: 'Enterprise-grade digital engine with custom Admin CMS, Database, Payment Gateways & priority support.',
    highlights: ['8–15+ Pages', 'Full CMS + Database', 'Payment Gateway', '6 Revisions'],
    sections: [
      {
        title: 'Core & Design',
        items: [
          { label: 'Pages', val: '8–15+ Pages', type: 'text' },
          { label: 'Responsive design', val: 'Included', type: 'check' },
          { label: 'Custom UI design', val: 'Premium', type: 'text' },
          { label: 'Contact / Enquiry form', val: 'Included', type: 'check' },
          { label: 'Animation / interactions', val: 'Advanced', type: 'text' },
        ],
      },
      {
        title: 'Reach & Integrations',
        items: [
          { label: 'WhatsApp integration', val: 'Included', type: 'check' },
          { label: 'Google Maps', val: 'Included', type: 'check' },
          { label: 'Social media links', val: 'Included', type: 'check' },
          { label: 'Basic SEO', val: 'Advanced', type: 'text' },
          { label: 'Search Console setup', val: 'Included', type: 'check' },
          { label: 'Analytics setup', val: 'Included', type: 'check' },
        ],
      },
      {
        title: 'Tech & Performance',
        items: [
          { label: 'Speed optimization', val: 'Advanced', type: 'text' },
          { label: 'Security / SSL setup', val: 'Included', type: 'check' },
          { label: 'Blog / News section', val: 'Included', type: 'check' },
          { label: 'Admin panel / CMS', val: 'Included', type: 'check' },
          { label: 'Database', val: 'Included', type: 'check' },
          { label: 'Payment integration', val: 'Included', type: 'check' },
        ],
      },
      {
        title: 'Support & Terms',
        items: [
          { label: 'Post-delivery support', val: '1 Month Free', type: 'highlight' },
          { label: 'Revisions', val: '6 Rounds', type: 'text' },
          { label: 'Project Price', val: '₹39,999 – ₹69,999+', type: 'price' },
        ],
      },
    ],
  },
};

export default function Services() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeMobileTier, setActiveMobileTier] = useState<TierKey>('gold');
  const [showMobileTable, setShowMobileTable] = useState(false);

  const currentTier = TIERS_DATA[activeMobileTier];

  useEffect(() => {
    const isMobile =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry/i.test(navigator.userAgent) ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const supportsHover = window.matchMedia('(hover: hover)').matches;

    if (isMobile || !supportsHover) return;

    const cards = containerRef.current?.querySelectorAll<HTMLElement>('[data-tilt]');
    if (!cards) return;

    const cleanups: (() => void)[] = [];

    cards.forEach((card) => {
      let raf: number | null = null;
      let hovering = false;

      const onEnter = () => {
        hovering = true;
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!hovering) return;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          const tiltX = ((y - r.height / 2) / (r.height / 2)) * -4;
          const tiltY = ((x - r.width / 2) / (r.width / 2)) * 4;
          card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-3px)`;
          card.style.boxShadow = `${-tiltY * 1.5}px ${
            -tiltX * 1.5 + 12
          }px 40px rgba(15,23,42,0.06)`;
          card.style.setProperty('--mouse-x', (x / r.width) * 100 + '%');
          card.style.setProperty('--mouse-y', (y / r.height) * 100 + '%');
        });
      };

      const onMouseLeave = () => {
        hovering = false;
        if (raf) cancelAnimationFrame(raf);
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          boxShadow: '0 0 0 rgba(15,23,42,0)',
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'transform,boxShadow',
        });
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);

      cleanups.push(() => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseleave', onMouseLeave);
        if (raf) cancelAnimationFrame(raf);
      });
    });

    return () => {
      cleanups.forEach((c) => c());
    };
  }, []);

  return (
    <section
      className="section services section--cinematic"
      id="services"
      ref={containerRef}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section__header section__header--center">
          <span className="section__label" id="services-label">
            02 — Services
          </span>
          <h2
            className="section__title parallax-layer"
            data-depth="0.06"
            id="services-title"
          >
            Website Development Packages
          </h2>
          <p className="section__desc" id="services-desc">
            Choose the right package to build, launch, and grow your digital
            presence.
          </p>
        </div>

        {/* Customer Journey */}
        <div
          className="services-journey"
          id="journey-steps"
          role="list"
          aria-label="Customer journey steps"
        >
          <div className="journey-step" role="listitem">
            <span className="journey-step__num">1</span>
            <span className="journey-step__text">Choose a Package</span>
          </div>
          <div className="journey-step__line" aria-hidden="true"></div>
          <div className="journey-step" role="listitem">
            <span className="journey-step__num">2</span>
            <span className="journey-step__text">
              We Design, Develop &amp; Deploy
            </span>
          </div>
          <div className="journey-step__line" aria-hidden="true"></div>
          <div className="journey-step" role="listitem">
            <span className="journey-step__num">3</span>
            <span className="journey-step__text">1 Month Free Support</span>
          </div>
          <div className="journey-step__line" aria-hidden="true"></div>
          <div className="journey-step" role="listitem">
            <span className="journey-step__num">4</span>
            <span className="journey-step__text">Add-ons When Needed</span>
          </div>
          <div className="journey-step__line" aria-hidden="true"></div>
          <div className="journey-step" role="listitem">
            <span className="journey-step__num">5</span>
            <span className="journey-step__text">Ongoing Support Plan</span>
          </div>
        </div>

        {/* Mobile-Optimized Service Compare Experience */}
        <div className="pkg-mobile-view" aria-label="Website Packages Comparison Mobile View">
          {/* Segmented Tier Switcher */}
          <div className="pkg-mobile-tabs" role="tablist" aria-label="Select website package tier">
            <button
              type="button"
              role="tab"
              aria-selected={activeMobileTier === 'silver'}
              className={`pkg-mobile-tab ${activeMobileTier === 'silver' ? 'pkg-mobile-tab--active' : ''}`}
              onClick={() => setActiveMobileTier('silver')}
            >
              <span className="pkg-mobile-tab__icon">🥈</span>
              <span>Silver</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMobileTier === 'gold'}
              className={`pkg-mobile-tab ${activeMobileTier === 'gold' ? 'pkg-mobile-tab--active' : ''}`}
              onClick={() => setActiveMobileTier('gold')}
            >
              <span className="pkg-mobile-tab__badge">Popular</span>
              <span className="pkg-mobile-tab__icon">🥇</span>
              <span>Gold</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMobileTier === 'platinum'}
              className={`pkg-mobile-tab ${activeMobileTier === 'platinum' ? 'pkg-mobile-tab--active' : ''}`}
              onClick={() => setActiveMobileTier('platinum')}
            >
              <span className="pkg-mobile-tab__icon">💎</span>
              <span>Platinum</span>
            </button>
          </div>

          {/* Context Diff Banner */}
          <div className="pkg-mobile-diff-banner">
            <span>{currentTier.tagline}</span>
          </div>

          {/* Active Tier Card */}
          <div className={`pkg-mobile-card ${currentTier.popular ? 'pkg-mobile-card--gold' : ''}`}>
            <div className="pkg-mobile-header">
              {currentTier.popular && (
                <div className="pkg-mobile-badge">
                  <span>★</span> Most Popular Choice
                </div>
              )}
              <div className="pkg-mobile-title-wrap">
                <div className="pkg-mobile-title">
                  <span className="pkg-mobile-icon">{currentTier.icon}</span>
                  <span>{currentTier.name} Package</span>
                </div>
                <span className="pkg-mobile-best-for">{currentTier.bestFor}</span>
              </div>
              <div className="pkg-mobile-pricing">
                <span className="pkg-mobile-price">{currentTier.price}</span>
                <span className="pkg-mobile-price-sub">Fixed project price • 1 Month Free Support</span>
              </div>
              <a href="#contact" className={`${currentTier.ctaClass} pkg-mobile-cta`} data-cursor="button">
                {currentTier.ctaText}
              </a>
            </div>

            {/* Quick highlights */}
            <div className="pkg-mobile-chips">
              {currentTier.highlights.map((h, i) => (
                <div key={i} className="pkg-mobile-chip">
                  <span>✦</span> {h}
                </div>
              ))}
            </div>

            {/* Feature categories */}
            <div className="pkg-mobile-sections">
              {currentTier.sections.map((sec, sIdx) => (
                <div key={sIdx} className="pkg-mobile-section">
                  <div className="pkg-mobile-sec-title">{sec.title}</div>
                  {sec.items.map((item, iIdx) => (
                    <div key={iIdx} className="pkg-mobile-row">
                      <span className="pkg-mobile-row-label">{item.label}</span>
                      <span className={`pkg-mobile-val pkg-mobile-val--${item.type}`}>
                        {item.type === 'check' && '✓ '}
                        {item.type === 'dash' && '— '}
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="pkg-mobile-bottom-cta">
              <a href="#contact" className={`${currentTier.ctaClass} btn--sm`} data-cursor="button">
                {currentTier.ctaText}
              </a>
              <div className="pkg-mobile-support-note">
                Need a custom feature? We customize any package for your requirements.
              </div>
            </div>
          </div>

          {/* Table Toggle Button */}
          <div className="pkg-mobile-table-toggle">
            <button
              type="button"
              className="pkg-mobile-table-toggle-btn"
              onClick={() => setShowMobileTable((prev) => !prev)}
              aria-expanded={showMobileTable}
            >
              {showMobileTable ? '▲ Hide Full Comparison Table' : '▼ Compare All 3 Tiers Side-by-Side (Table View)'}
            </button>
          </div>
        </div>

        {/* Pricing Comparison Table (Desktop Full View & Mobile Toggleable) */}
        <div
          className={`pkg-table-wrap ${showMobileTable ? 'mobile-table-shown' : 'mobile-table-hidden'}`}
          id="packages-table"
        >
          <div className="pkg-table-scroll-hint" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Scroll to compare
          </div>
          <table
            className="pkg-table"
            role="table"
            aria-label="Website development packages comparison"
          >
            <thead>
              <tr>
                <th className="pkg-table__feature-head" scope="col">
                  Feature
                </th>
                <th className="pkg-table__col pkg-table__col--silver" scope="col">
                  <div className="pkg-table__tier">
                    <span className="pkg-table__tier-icon">🥈</span>
                    <span className="pkg-table__tier-name">Silver</span>
                  </div>
                </th>
                <th className="pkg-table__col pkg-table__col--gold" scope="col">
                  <span className="badge badge--popular">Most Popular</span>
                  <div className="pkg-table__tier">
                    <span className="pkg-table__tier-icon">🥇</span>
                    <span className="pkg-table__tier-name">Gold</span>
                  </div>
                </th>
                <th
                  className="pkg-table__col pkg-table__col--platinum"
                  scope="col"
                >
                  <div className="pkg-table__tier">
                    <span className="pkg-table__tier-icon">💎</span>
                    <span className="pkg-table__tier-name">Platinum</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pkg-table__feature">Best for</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__text">Small businesses</span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__text">Growing businesses</span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__text">
                    Professional / large businesses
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Pages</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__text">3–5</span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__text">5–8</span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__text">8–15+</span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Responsive design</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Custom UI design</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__text">Basic</span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__text">Advanced</span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__text">Premium</span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Contact / Enquiry form</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">WhatsApp integration</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Google Maps</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Social media links</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Basic SEO</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__dash" aria-label="Not included">
                    —
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__text">Advanced</span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Google Search Console setup</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__dash" aria-label="Not included">
                    —
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Analytics</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__dash" aria-label="Not included">
                    —
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Animation / interactions</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__text">Basic</span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__text">Medium</span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__text">Advanced</span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Blog / News section</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__dash" aria-label="Not included">
                    —
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Admin panel / CMS</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__dash" aria-label="Not included">
                    —
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__optional">Optional</span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Database</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__dash" aria-label="Not included">
                    —
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__optional">Optional</span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Payment integration</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__dash" aria-label="Not included">
                    —
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__optional">Optional</span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Speed optimization</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__text">Basic</span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__text">Advanced</span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Security / SSL setup</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__check" aria-label="Included">
                    ✓
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Post-delivery support</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__text pkg-table__text--highlight">
                    1 Month Free
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__text pkg-table__text--highlight">
                    1 Month Free
                  </span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__text pkg-table__text--highlight">
                    1 Month Free
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pkg-table__feature">Revisions</td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__text">2</span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__text">4</span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__text">6</span>
                </td>
              </tr>
              <tr className="pkg-table__row--price">
                <td className="pkg-table__feature pkg-table__feature--price">
                  Project Price
                </td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <span className="pkg-table__price">₹7,999 – ₹12,999</span>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <span className="pkg-table__price">₹17,999 – ₹29,999</span>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <span className="pkg-table__price">₹39,999 – ₹69,999+</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="pkg-table__feature"></td>
                <td className="pkg-table__col pkg-table__col--silver">
                  <a
                    href="#contact"
                    className="btn btn--ghost btn--sm"
                    data-cursor="button"
                    aria-label="Choose Silver package"
                  >
                    Choose Silver
                  </a>
                </td>
                <td className="pkg-table__col pkg-table__col--gold">
                  <a
                    href="#contact"
                    className="btn btn--primary btn--sm"
                    data-cursor="button"
                    aria-label="Choose Gold package"
                  >
                    Choose Gold
                  </a>
                </td>
                <td className="pkg-table__col pkg-table__col--platinum">
                  <a
                    href="#contact"
                    className="btn btn--ghost btn--sm"
                    data-cursor="button"
                    aria-label="Choose Platinum package"
                  >
                    Choose Platinum
                  </a>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Paid Add-ons */}
      <div className="services-addons" id="services-addons">
        <div className="container">
          <div className="section__header section__header--center">
            <h3 className="services-sub__title" id="addons-title">
              Paid Add-ons
            </h3>
            <p className="section__desc" id="addons-desc">
              Extend your project with additional features and services when you
              need them.
            </p>
          </div>
          <div className="addons-grid" id="addons-grid">
            <div className="addon-card" data-cursor="card" data-tilt>
              <span className="addon-card__icon" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </span>
              <h4 className="addon-card__title">Extra Page</h4>
              <p className="addon-card__price">₹1,000 – ₹2,000</p>
            </div>
            <div className="addon-card" data-cursor="card" data-tilt>
              <span className="addon-card__icon" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </span>
              <h4 className="addon-card__title">Logo Design</h4>
              <p className="addon-card__price">₹1,500 – ₹4,000</p>
            </div>
            <div className="addon-card" data-cursor="card" data-tilt>
              <span className="addon-card__icon" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </span>
              <h4 className="addon-card__title">Advanced SEO</h4>
              <p className="addon-card__price">Starting from ₹5,000</p>
            </div>
            <div className="addon-card" data-cursor="card" data-tilt>
              <span className="addon-card__icon" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </span>
              <h4 className="addon-card__title">Payment Gateway Integration</h4>
              <p className="addon-card__price">₹3,000 – ₹7,000</p>
            </div>
            <div className="addon-card" data-cursor="card" data-tilt>
              <span className="addon-card__icon" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              <h4 className="addon-card__title">Admin Panel / CMS</h4>
              <p className="addon-card__price">₹5,000 – ₹15,000</p>
            </div>
            <div className="addon-card" data-cursor="card" data-tilt>
              <span className="addon-card__icon" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </span>
              <h4 className="addon-card__title">Database Functionality</h4>
              <p className="addon-card__price">Starting from ₹5,000</p>
            </div>
            <div className="addon-card" data-cursor="card" data-tilt>
              <span className="addon-card__icon" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <h4 className="addon-card__title">Domain</h4>
              <p className="addon-card__price">Charged separately</p>
            </div>
            <div className="addon-card" data-cursor="card" data-tilt>
              <span className="addon-card__icon" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                </svg>
              </span>
              <h4 className="addon-card__title">Hosting</h4>
              <p className="addon-card__price">Charged separately</p>
            </div>
          </div>
          <p className="addons-note">
            Add-on pricing may vary depending on project requirements and
            complexity.
          </p>
          <div className="addons-cta">
            <a href="#contact" className="btn btn--ghost" data-cursor="button">
              Request a Quote
            </a>
          </div>
        </div>
      </div>

      {/* 1 Month Free Support */}
      <div className="free-support" id="free-support">
        <div className="container">
          <div className="free-support__card">
            <div className="free-support__header">
              <h3 className="services-sub__title" id="free-support-title">
                1 Month Free Support
              </h3>
              <p className="free-support__subtitle">
                Every completed project includes complimentary post-delivery
                support for one month.
              </p>
            </div>
            <div
              className="free-support__timeline"
              role="list"
              aria-label="Support timeline"
            >
              <div className="free-support__step" role="listitem">
                <span className="free-support__step-icon" aria-hidden="true">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </span>
                <span className="free-support__step-text">Project Completed</span>
              </div>
              <div className="free-support__connector" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div className="free-support__step" role="listitem">
                <span className="free-support__step-icon" aria-hidden="true">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                </span>
                <span className="free-support__step-text">
                  Deployed &amp; Handed Over
                </span>
              </div>
              <div className="free-support__connector" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div
                className="free-support__step free-support__step--highlight"
                role="listitem"
              >
                <span className="free-support__step-icon" aria-hidden="true">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <span className="free-support__step-text">
                  <strong>1 Month Free</strong>
                </span>
              </div>
              <div className="free-support__connector" aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div className="free-support__step" role="listitem">
                <span className="free-support__step-icon" aria-hidden="true">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <span className="free-support__step-text">
                  Optional Paid Plans
                </span>
              </div>
            </div>
            <p className="free-support__note">
              After your project is successfully deployed and handed over,
              VASHIK Technology provides 1 month of free post-delivery support for
              issues related to the delivered project.
            </p>
          </div>
        </div>
      </div>

      {/* Ongoing Support Plans */}
      <div className="support-plans" id="support-plans">
        <div className="container">
          <div className="section__header section__header--center">
            <h3 className="services-sub__title" id="support-plans-title">
              Ongoing Support &amp; Maintenance
            </h3>
            <p className="section__desc" id="support-plans-desc">
              Continue with a support plan for ongoing maintenance, monitoring,
              optimization, and technical assistance.
            </p>
          </div>
          <div className="support-plans__grid">
            {/* Silver Support */}
            <div className="support-card" data-cursor="card" data-tilt>
              <div className="support-card__header">
                <span className="support-card__icon">🥈</span>
                <h4 className="support-card__tier">Silver</h4>
                <p className="support-card__label">Basic Support</p>
                <p className="support-card__price">₹10,000</p>
              </div>
              <ul className="support-card__features" role="list">
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Bug &amp; error fixing
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Basic technical support
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Software / content updates
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Backup support
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Basic compatibility fixes
                </li>
              </ul>
              <a
                href="#contact"
                className="btn btn--ghost btn--sm support-card__cta"
                data-cursor="button"
              >
                Choose Silver
              </a>
            </div>

            {/* Gold Support */}
            <div className="support-card support-card--gold" data-cursor="card" data-tilt>
              <span className="badge badge--popular">Most Popular</span>
              <div className="support-card__header">
                <span className="support-card__icon">🥇</span>
                <h4 className="support-card__tier">Gold</h4>
                <p className="support-card__label">Advanced Support</p>
                <p className="support-card__price">₹25,000</p>
              </div>
              <ul className="support-card__features" role="list">
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Advanced bug fixing &amp; debugging
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Performance optimization
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Security monitoring &amp; updates
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Database maintenance
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  API / integration support
                </li>
              </ul>
              <a
                href="#contact"
                className="btn btn--primary btn--sm support-card__cta"
                data-cursor="button"
              >
                Choose Gold
              </a>
            </div>

            {/* Platinum Support */}
            <div className="support-card" data-cursor="card" data-tilt>
              <div className="support-card__header">
                <span className="support-card__icon">💎</span>
                <h4 className="support-card__tier">Platinum</h4>
                <p className="support-card__label">Premium Support</p>
                <p className="support-card__price">₹35,000</p>
              </div>
              <ul className="support-card__features" role="list">
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Priority / emergency resolution
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Continuous app monitoring
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Server / hosting management
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Minor feature enhancements
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Dedicated technical support
                </li>
              </ul>
              <a
                href="#contact"
                className="btn btn--ghost btn--sm support-card__cta"
                data-cursor="button"
              >
                Choose Platinum
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Our Projects */}
      <div className="services-projects" id="services-projects">
        <div className="container">
          <div className="section__header section__header--center">
            <h3 className="services-sub__title" id="projects-title">
              Our Projects
            </h3>
            <p className="section__desc" id="projects-desc">
              Platforms we&apos;ve built that showcase our engineering
              capabilities.
            </p>
          </div>
          <div className="projects-grid" id="projects-grid">
            <article className="project-card" data-cursor="card" data-tilt>
              <div className="project-card__index">01</div>
              <div className="project-card__icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                  <polyline points="9 21 9 12 15 12 15 21" />
                </svg>
              </div>
              <h4 className="project-card__title">Mr.Helper</h4>
              <p className="project-card__text">
                Mr.Helper is a smart digital platform that connects customers
                with trusted local service providers for everyday home needs. It
                allows users to quickly book services like repairs, cleaning, and
                maintenance through a simple mobile app. The platform aims to save
                time and provide reliable, convenient home services at your
                doorstep.
              </p>
              <a
                href="https://mr-helper-services.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="project-card__link"
                data-cursor="link"
              >
                Visit Site &rarr;
              </a>
            </article>
            <article className="project-card" data-cursor="card" data-tilt>
              <div className="project-card__index">02</div>
              <div className="project-card__icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h4 className="project-card__title">RAKSHAK-AI</h4>
              <p className="project-card__text">
                Rakshak AI v1 is an intelligent security layer placed between
                users and the database. It automatically scans every uploaded
                image before it reaches the server. The system detects 18+ content
                and hidden hacking scripts embedded in images. If any malicious or
                inappropriate content is found, the upload is instantly blocked.
                This ensures clean, safe, and secure data storage for applications
                and platforms.
              </p>
              <a
                href="https://rakshak-ufgj.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="project-card__link"
                data-cursor="link"
              >
                Visit Site &rarr;
              </a>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
