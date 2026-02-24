import { useEffect, useRef } from 'react';
import s from './WhyUs.module.css';

const features = [
  { num: '01', icon: '🌿', title: 'Zéro Pesticide', desc: 'Chaque variété est cultivée dans des conditions optimales, sans aucun produit chimique. La pureté n\'est pas une option, c\'est une obligation.' },
  { num: '02', icon: '🔍', title: 'Traçabilité Totale', desc: 'De la graine à la livraison, nous traçons chaque étape. Vous savez exactement ce que vous consommez et d\'où cela vient. Transparence absolue.' },
  { num: '03', icon: '🤫', title: 'Discrétion Absolue', desc: 'Notre réseau de distribution opère avec une discrétion exemplaire. Votre confidentialité est notre priorité — aucun compromis n\'est acceptable.' },
  { num: '04', icon: '⭐', title: 'Sélection Premium', desc: 'Seules les meilleures variétés intègrent notre catalogue. Une sélection rigoureuse guidée par l\'excellence sensorielle et la cohérence d\'expérience.' },
  { num: '05', icon: '🏆', title: 'Service d\'Élite', desc: 'Chaque client Purple CBD est traité comme un invité VIP. Conseils personnalisés, disponibilité et réactivité — c\'est notre marque de fabrique.' },
  { num: '06', icon: '💎', title: 'Programme Fidélité', desc: 'Bientôt disponible — un programme de fidélité exclusif qui récompense chaque interaction. Vos habitudes méritent d\'être valorisées.' },
];

const delayMap = ['', s.delay1, s.delay2, s.delay1, s.delay2, s.delay3];

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function WhyUs({ onLoginClick, onInternalClick }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add(s.visible)),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    el.querySelectorAll(`.${s.reveal}`).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="why" className={s.section} ref={sectionRef}>
      <div className="container">
        <div className={s.header}>
          <div className={`${s.sectionLabel} ${s.reveal}`}>Notre Engagement</div>
          <h2 className={`${s.title} ${s.reveal} ${s.delay1}`}>
            Pourquoi<br />Purple CBD ?
          </h2>
          <p className={`${s.subtitle} ${s.reveal} ${s.delay2}`}>
            Nous n'avons pas construit une boutique. Nous avons établi un standard. Chaque
            détail de notre processus est conçu pour vous offrir ce qu'il y a de mieux.
          </p>
        </div>

        <div className={s.grid}>
          {features.map((f, i) => (
            <div key={f.num} className={`${s.item} ${s.reveal} ${delayMap[i]}`}>
              <div className={s.itemNum}>{f.num}</div>
              <div className={s.itemIcon}>{f.icon}</div>
              <div className={s.itemTitle}>{f.title}</div>
              <p className={s.itemDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className={s.ctaBlock}>
          <div className={`${s.ctaCard} ${s.ctaCardLeft} ${s.reveal}`}>
            <div className={s.ctaTitle}>Rejoindre l'élite</div>
            <p className={s.ctaDesc}>
              Créez votre compte et accédez à notre catalogue complet, votre historique de
              commandes et le futur programme de fidélité exclusif.
            </p>
            <button className={s.btnPrimary} onClick={onLoginClick}>
              <span>Créer un compte</span>
              <ArrowIcon />
            </button>
          </div>

          <div className={`${s.ctaCard} ${s.ctaCardRight} ${s.reveal} ${s.delay1}`}>
            <div className={s.ctaTitle}>Espace Partenaire</div>
            <p className={s.ctaDesc}>
              Vous êtes un membre de l'équipe Purple CBD ? Accédez à votre dashboard interne,
              gérez les stocks et suivez les performances en temps réel.
            </p>
            <button className={s.btnOutline} onClick={onInternalClick}>
              <span>Accès Équipe</span>
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
