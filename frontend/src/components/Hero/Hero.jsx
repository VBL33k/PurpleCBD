import s from './Hero.module.css';

function ArrowIcon() {
  return (
    <svg className={s.btnPrimaryIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="hero" className={s.hero}>
      <div className={s.bgGrid} aria-hidden="true" />

      <div className={s.inner}>
        <div className={s.eyebrow}>Los Santos · Luxe Botanique · Est. 2025</div>

        <h1 className={s.title}>
          <span className={s.titlePurple}>Purple</span>
          <span className={s.titleWhite}>CBD</span>
        </h1>

        <p className={s.tagline}>
          L'excellence florale pour une{' '}
          <span className={s.taglineAccent}>clientèle d'élite</span>
        </p>

        <p className={s.desc}>
          Purple CBD est la référence luxe du bien-être urbain, alliant innovation botanique et
          discrétion absolue. Chaque produit est une expérience sensorielle — conçu pour ceux
          qui refusent de faire des compromis.
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
