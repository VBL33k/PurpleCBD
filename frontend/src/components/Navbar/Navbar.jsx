import s from './Navbar.module.css';

const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

function UserIcon() {
  return (
    <svg className={s.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg className={s.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export default function Navbar({ scrolled, onLoginClick, onInternalClick }) {
  return (
    <nav className={`${s.nav} ${scrolled ? s.scrolled : ''}`}>
      <div className={s.inner}>
        <a href="#hero" className={s.logo}>
          <img src={LOGO} alt="Purple CBD" className={s.logoImg} />
        </a>

        <ul className={s.links}>
          <li><a href="#about">Histoire</a></li>
          <li><a href="#menu">La Carte</a></li>
          <li><a href="#why">Qualité</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <div className={s.actions}>
          <button className={s.btnLogin} onClick={onLoginClick}>
            <UserIcon />
            <span>Connexion</span>
          </button>
          <a href="https://purple-cbd-frontend.onrender.com/dashboard/login" className={s.btnInternal}>
            <DashboardIcon />
            <span>Espace Interne</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
