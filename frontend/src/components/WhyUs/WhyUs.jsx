import { useEffect, useRef } from 'react';
import s from './WhyUs.module.css';

/* SVG Icons */
function LeafIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>; }
function ShieldIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>; }
function StarIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function CrownIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M5 20 3 8l4.5 3L12 4l4.5 7L21 8l-2 12"/></svg>; }
function GiftIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" x2="12" y1="22" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>; }
function ArrowIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>; }

const features = [
  { num: '01', Icon: LeafIcon,   title: 'Zéro Pesticide',      desc: 'Chaque variété cultivée dans des conditions optimales, sans aucun produit chimique. La pureté n\'est pas une option.' },
  { num: '02', Icon: SearchIcon, title: 'Traçabilité Totale',   desc: 'De la graine à la livraison, chaque étape est tracée. Vous savez exactement ce que vous consommez.' },
  { num: '03', Icon: ShieldIcon, title: 'Discrétion Absolue',   desc: 'Notre réseau opère avec une discrétion exemplaire. Votre confidentialité est notre priorité.' },
  { num: '04', Icon: StarIcon,   title: 'Sélection Premium',    desc: 'Seules les meilleures variétés intègrent notre catalogue. Une rigueur guidée par l\'excellence sensorielle.' },
  { num: '05', Icon: CrownIcon,  title: 'Service d\'Élite',     desc: 'Chaque client Purple CBD est traité comme un invité VIP. Conseils personnalisés et disponibilité totale.' },
  { num: '06', Icon: GiftIcon,   title: 'Programme Fidélité',   desc: 'Bientôt disponible — un programme exclusif qui récompense chaque interaction avec Purple CBD.' },
];

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
            Nous n'avons pas construit une boutique. Nous avons établi un standard — chaque
            détail conçu pour vous offrir l'excellence absolue.
          </p>
        </div>

        <div className={s.grid}>
          {features.map((f, i) => (
            <div key={f.num} className={`${s.item} ${s.reveal} ${i % 3 !== 0 ? s[`delay${(i % 3)}`] : ''}`}>
              <div className={s.itemNum}>{f.num}</div>
              <div className={s.itemIcon}><f.Icon /></div>
              <div className={s.itemTitle}>{f.title}</div>
              <p className={s.itemDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className={s.ctaBlock}>
          <div className={`${s.ctaCard} ${s.ctaCardLeft} ${s.reveal}`}>
            <div className={s.ctaTitle}>Rejoindre l'élite</div>
            <p className={s.ctaDesc}>
              Créez votre compte et accédez au catalogue complet, votre historique et le
              futur programme de fidélité exclusif.
            </p>
            <button className={s.btnPrimary} onClick={onLoginClick}>
              <span>Créer un compte</span>
              <ArrowIcon />
            </button>
          </div>

          <div className={`${s.ctaCard} ${s.ctaCardRight} ${s.reveal} ${s.delay1}`}>
            <div className={s.ctaTitle}>Espace Partenaire</div>
            <p className={s.ctaDesc}>
              Membre de l'équipe Purple CBD ? Accédez au dashboard interne, gérez les stocks
              et suivez les performances en temps réel.
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
