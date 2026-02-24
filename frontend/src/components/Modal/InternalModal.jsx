import Modal from './Modal';
import s from './Modal.module.css';

const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

export default function InternalModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <img src={LOGO} alt="Purple CBD" className={s.logo} />
      <div className={s.title}>Dashboard Interne</div>
      <div className={s.sub}>Accès Équipe Restreint</div>

      <div className={s.formGroup}>
        <label className={s.label}>Identifiant Agent</label>
        <input type="text" className={s.input} placeholder="ID Équipe" />
      </div>
      <div className={s.formGroup}>
        <label className={s.label}>Code d'accès sécurisé</label>
        <input type="password" className={s.input} placeholder="••••••••" />
      </div>
      <button className={s.submit}>Accéder au Dashboard</button>
      <p className={s.note}>
        Accès réservé aux membres autorisés.
        <br />
        Stocks · Ventes · Gestion · Analytics
        <span style={{ color: 'var(--gray-600)', fontSize: '10px', display: 'block', marginTop: '4px' }}>
          Dashboard en cours de déploiement
        </span>
      </p>
    </Modal>
  );
}
