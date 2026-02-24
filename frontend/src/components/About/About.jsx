import { useEffect, useRef } from 'react';
import { founders } from '../../data/founders';
import s from './About.module.css';

const LOGO = 'https://i.imgur.com/CbcU0Qp.png';

const stats = [
  { number: '3', label: 'Fondateurs' },
  { number: '4', label: 'Variétés' },
  { number: '0%', label: 'Pesticides' },
  { number: '∞', label: 'Discrétion' },
];

export default function About() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(s.visible);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    el.querySelectorAll(`.${s.reveal}`).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className={s.section} ref={sectionRef}>
      <div className="container">
        <div className={s.grid}>
          {/* Visual */}
          <div className={`${s.reveal}`}>
            <div className={s.card}>
              <img src={LOGO} alt="Purple CBD" className={s.logo} />
              <div className={s.stats}>
                {stats.map((stat) => (
                  <div key={stat.label} className={s.statItem}>
                    <span className={s.statNumber}>{stat.number}</span>
                    <span className={s.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className={`${s.sectionLabel} ${s.reveal} ${s.delay1}`}>
              Notre Histoire
            </div>
            <h2 className={`${s.title} ${s.reveal} ${s.delay1}`}>
              Trois visions.<br />Une marque.
            </h2>
            <p className={`${s.introText} ${s.reveal} ${s.delay2}`}>
              Nés de la street, formés par l'excellence — Norris, Crowel et Sherrod ont
              redéfini ce que peut être le bien-être botanique en milieu urbain.
            </p>
            <p className={`${s.desc} ${s.reveal} ${s.delay2}`}>
              Jeffery B. Norris apporte une expertise technique approfondie dans la sélection
              et la cultivation des variétés premiums. Clyde Crowel, stratège né, orchestre un
              réseau de distribution aussi discret qu'efficace. Travis Sherrod, visionnaire de
              l'image de marque, façonne l'identité qui distingue Purple CBD de toute
              concurrence.
            </p>
            <p className={`${s.desc} ${s.reveal} ${s.delay3}`}>
              Ensemble, ils ont bâti bien plus qu'une enseigne : un mouvement. Une culture du
              raffinement appliquée à un secteur qui réclamait sa révolution.
            </p>
            <div className={`${s.divider} ${s.reveal} ${s.delay3}`} />

            <div className={s.founders}>
              {founders.map((founder, i) => (
                <div
                  key={founder.id}
                  className={`${s.founderCard} ${s.reveal} ${
                    i === 0 ? s.delay2 : i === 1 ? s.delay3 : s.delay4
                  }`}
                >
                  <div className={s.avatar}>{founder.initials}</div>
                  <div>
                    <div className={s.founderName}>{founder.name}</div>
                    <div className={s.founderRole}>{founder.role}</div>
                    <div className={s.founderBio}>{founder.bio}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
