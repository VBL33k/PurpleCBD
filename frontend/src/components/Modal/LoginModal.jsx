import { useState } from 'react';
import Modal from './Modal';
import s from './Modal.module.css';

const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

export default function LoginModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('login');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <img src={LOGO} alt="Purple CBD" className={s.logo} />
      <div className={s.title}>Espace Client</div>
      <div className={s.sub}>Purple CBD — Membres Exclusifs</div>

      <div className={s.tabs}>
        <button
          className={`${s.tab} ${tab === 'login' ? s.activeTab : ''}`}
          onClick={() => setTab('login')}
        >
          Connexion
        </button>
        <button
          className={`${s.tab} ${tab === 'register' ? s.activeTab : ''}`}
          onClick={() => setTab('register')}
        >
          Inscription
        </button>
      </div>

      <div className={`${s.tabPanel} ${tab === 'login' ? s.activePanel : ''}`}>
        <div className={s.formGroup}>
          <label className={s.label}>Identifiant</label>
          <input type="text" className={s.input} placeholder="Votre identifiant" />
        </div>
        <div className={s.formGroup}>
          <label className={s.label}>Mot de passe</label>
          <input type="password" className={s.input} placeholder="••••••••" />
        </div>
        <button className={s.submit}>Accéder à mon espace</button>
        <p className={s.note}>
          Programme de fidélité · Historique · Offres exclusives
          <span className={s.noteComing}>Bientôt disponible</span>
        </p>
      </div>

      <div className={`${s.tabPanel} ${tab === 'register' ? s.activePanel : ''}`}>
        <div className={s.formGroup}>
          <label className={s.label}>Nom complet</label>
          <input type="text" className={s.input} placeholder="Votre nom" />
        </div>
        <div className={s.formGroup}>
          <label className={s.label}>Identifiant</label>
          <input type="text" className={s.input} placeholder="Choisir un identifiant" />
        </div>
        <div className={s.formGroup}>
          <label className={s.label}>Mot de passe</label>
          <input type="password" className={s.input} placeholder="••••••••" />
        </div>
        <button className={s.submit}>Rejoindre Purple CBD</button>
        <p className={s.note}>Accès au programme fidélité dès l'ouverture</p>
      </div>
    </Modal>
  );
}
