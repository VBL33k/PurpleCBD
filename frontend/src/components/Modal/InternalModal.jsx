import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import s from './Modal.module.css';

const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

export default function InternalModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  function handleAccess() {
    onClose();
    navigate('/dashboard');
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <img src={LOGO} alt="Purple CBD" className={s.logo} />
      <div className={s.title}>Dashboard Interne</div>
      <div className={s.sub}>Accès Équipe Restreint</div>

      <p className={s.note}>
        Accès réservé aux membres autorisés de l'équipe Purple CBD.
        <br />
        Connectez-vous avec vos identifiants pour accéder au tableau de bord.
      </p>

      <button className={s.submit} onClick={handleAccess}>
        Accéder au Dashboard
      </button>
    </Modal>
  );
}
