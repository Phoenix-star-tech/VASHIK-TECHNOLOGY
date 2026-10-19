'use client';

export default function Contact() {
  const email = 'vashiktechnology@gmail.com';

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isMobile =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry/i.test(navigator.userAgent) ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (!isMobile) {
      e.preventDefault();
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  return (
    <section className="section contact section--cinematic" id="contact">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__label" id="contact-label">
            04 — Contact
          </span>
          <h2
            className="section__title parallax-layer"
            data-depth="0.06"
            id="contact-title"
          >
            Let&apos;s build something
            <br />
            that matters.
          </h2>
          <p className="section__desc" id="contact-desc">
            We&apos;re selective about the projects we take on. If you&apos;re
            building something ambitious, we&apos;d like to hear about it.
          </p>
        </div>
        <div className="contact__actions" id="contact-actions">
          <a
            href={`mailto:${email}`}
            className="btn btn--primary btn--lg"
            data-cursor="button"
            onClick={handleEmailClick}
          >
            {email}
          </a>
        </div>
      </div>
    </section>
  );
}
