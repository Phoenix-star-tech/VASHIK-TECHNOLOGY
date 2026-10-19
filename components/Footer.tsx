export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="footer__logo">VASHIK TECHNOLOGIES</span>
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
          </div>
          <div className="footer__copy">
            <p>&copy; 2026 VASHIK TECHNOLOGIES. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
