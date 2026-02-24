import s from './Footer.module.css';

const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

export default function Footer({ onLoginClick, onInternalClick }) {
  return (
    <footer id="contact" className={s.footer}>
      <div className="container">
        <div className={s.inner}>
          {/* Brand */}
          <div>
            <div className={s.logoRow}>
              <img src={LOGO} alt="Purple CBD" className={s.logoImg} />
            </div>
            <p className={s.tagline}>
              "La référence luxe du bien-être urbain — pour ceux qui n'acceptent que le meilleur."
            </p>
            <p className={s.address}>
              Los Santos, San Andreas<br />
              Contact discret sur réservation
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div className={s.colTitle}>Navigation</div>
            <ul className={s.links}>
              <li><a href="#about">Notre Histoire</a></li>
              <li><a href="#menu">La Carte</a></li>
              <li><a href="#why">Qualité &amp; Engagement</a></li>
              <li><button onClick={onLoginClick}>Mon Compte</button></li>
            </ul>
          </div>

          {/* Team */}
          <div>
            <div className={s.colTitle}>Équipe</div>
            <ul className={s.links}>
              <li><a href="#">J. B. Norris</a></li>
              <li><a href="#">C. Crowel</a></li>
              <li><a href="#">T. Sherrod</a></li>
              <li><button onClick={onInternalClick}>Dashboard Interne</button></li>
            </ul>
          </div>
        </div>

        <div className={s.bottom}>
          <div className={s.legal}>
            <span className={s.legalTitle}>Mentions Légales (RP)</span>
            Purple CBD est une entité fictive opérant exclusivement dans le cadre d'un serveur
            de jeu de rôle (RP). Tous les produits, personnages et transactions mentionnés sont
            fictifs et n'ont aucune existence légale réelle. Toute ressemblance avec des faits
            réels serait purement fortuite. Ce site est créé à des fins de divertissement dans
            le cadre d'une expérience de roleplay.
          </div>
          <div className={s.credits}>
            <span className={s.creditsName}>Purple CBD</span><br />
            <span>© 2025 · Los Santos, SA</span><br />
            <span>Norris · Crowel · Sherrod</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
