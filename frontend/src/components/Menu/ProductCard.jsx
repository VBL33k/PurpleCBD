import { useRef } from 'react';
import s from './Menu.module.css';

const themeClass = {
  purple: s.cardPurple,
  earth: s.cardEarth,
  lemon: s.cardLemon,
  dark: s.cardDark,
};

export default function ProductCard({ product, revealClass }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    card.style.transform = `translateY(-8px) rotateX(${-y}deg) rotateY(${x}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = '';
  };

  return (
    <div
      ref={cardRef}
      className={`${s.card} ${themeClass[product.theme] || ''} ${revealClass}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <span className={s.badge}>{product.badge}</span>
      <span className={s.number}>{product.number}</span>
      <span className={s.icon}>{product.icon}</span>
      <div className={s.name}>{product.name}</div>
      <div className={s.strain}>{product.strain}</div>
      <p className={s.desc}>{product.description}</p>
      <div className={s.tags}>
        {product.tags.map((tag) => (
          <span key={tag} className={s.tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
