import s from './Hero.module.css';

function ArrowIcon() {
  return (
    <svg className={s.btnPrimaryIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="hero" className={s.hero}>
      <div className={s.bgGrid} aria-hidden="true" />

      <div className={s.inner}>
        <div className={s.eyebrow}>
          <span className={s.eyebrowDot} />
          Townsend · Bien-être Botanique · Est. 2025
        </div>

        <h1 className={s.title}>
          <span className={s.titleLine1}>Purple</span>
          <span className={s.titleLine2}>CBD</span>
        </h1>

        <p className={s.tagline}>
          L'excellence florale pour une{' '}
          <span className={s.taglineAccent}>clientèle d'élite</span>.
          Innovation botanique et discrétion absolue.
        </p>

        <div className={s.cta}>
          <a href="#menu" className={s.btnPrimary}>
            <span className={s.btnPrimaryText}>Découvrir la Carte</span>
            <ArrowIcon />
          </a>
          <a href="#about" className={s.btnOutline}>
            Notre Histoire
          </a>
        </div>
      </div>

      <div className={s.scrollHint} aria-hidden="true">
        <div className={s.scrollLine} />
        <span className={s.scrollText}>Scroll</span>
      </div>
    </section>
  );
}
