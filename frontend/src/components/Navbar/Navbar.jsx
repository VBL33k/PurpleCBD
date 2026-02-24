import s from './Navbar.module.css';

const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

function UserIcon() {
  return (
    <svg className={s.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className={s.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

export default function Navbar({ scrolled, onLoginClick, onInternalClick }) {
  return (
    <nav className={`${s.nav} ${scrolled ? s.scrolled : ''}`}>
      <a href="#hero" className={s.logo}>
        <img src={LOGO} alt="Purple CBD" className={s.logoImg} />
      </a>

      <ul className={s.links}>
        <li><a href="#about">Notre Histoire</a></li>
        <li><a href="#menu">La Carte</a></li>
        <li><a href="#why">Qualité</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <div className={s.actions}>
        <button className={s.btnLogin} onClick={onLoginClick}>
          <UserIcon />
          <span>Se connecter</span>
        </button>
        <button className={s.btnInternal} onClick={onInternalClick}>
          <GridIcon />
          <span>Espace Interne</span>
        </button>
      </div>
    </nav>
  );
}
