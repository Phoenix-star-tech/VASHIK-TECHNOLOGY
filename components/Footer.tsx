import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand">
            <a href="#" className="footer__logo-wrap" data-cursor="link">
              <Image
                src="/logo.png"
                alt="VASHIK Logo"
                width={26}
                height={26}
                className="footer__logo-img"
              />
              <span className="footer__logo">VASHIK TECHNOLOGIES</span>
            </a>
            <p className="footer__tagline">We build what matters</p>
          </div>
          <div className="footer__links">
            <a href="#about" className="footer__link" data-cursor="link">
              About
            </a>
            <a href="#services" className="footer__link" data-cursor="link">
              Services
            </a>
            <a href="#experience" className="footer__link" data-cursor="link">
              Approach
            </a>
            <a href="#contact" className="footer__link" data-cursor="link">
              Contact
            </a>
            <a href="/announcements" className="footer__link" data-cursor="link">
              Announcements
            </a>
            <a href="/portal" className="footer__link" data-cursor="link">
              Employee Portal
            </a>
          </div>
          <div className="footer__copy">
            <p>&copy; 2026 VASHIK TECHNOLOGIES. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
