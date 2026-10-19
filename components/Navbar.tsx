'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`} id="nav">
      <div className="nav__inner">
        <a href="#" className="nav__logo" id="nav-logo" data-cursor="link">
          <Image
            src="/logo.png"
            alt="VASHIK Logo"
            width={32}
            height={32}
            className="nav__logo-img"
            priority
          />
          <span>VASHIK TECHNOLOGIES</span>
        </a>
        <div className={`nav__links ${isOpen ? 'is-open' : ''}`} id="nav-links">
          <a
            href="#about"
            className="nav__link"
            data-cursor="link"
            onClick={closeMenu}
          >
            About
          </a>
          <a
            href="#services"
            className="nav__link"
            data-cursor="link"
            onClick={closeMenu}
          >
            Services
          </a>
          <a
            href="#experience"
            className="nav__link"
            data-cursor="link"
            onClick={closeMenu}
          >
            Approach
          </a>
          <a
            href="#contact"
            className="nav__link"
            data-cursor="link"
            onClick={closeMenu}
          >
            Contact
          </a>
          <a
            href="/portal"
            className="nav__link nav__portal-cta"
            data-cursor="link"
            onClick={closeMenu}
          >
            Employee Login
          </a>
        </div>
        <button
          className={`nav__toggle ${isOpen ? 'is-open' : ''}`}
          id="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
