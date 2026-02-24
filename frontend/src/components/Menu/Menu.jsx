import { useEffect, useRef } from 'react';
import { products } from '../../data/products';
import ProductCard from './ProductCard';
import s from './Menu.module.css';

const delayClasses = [s.reveal, `${s.reveal} ${s.delay1}`, `${s.reveal} ${s.delay2}`, `${s.reveal} ${s.delay3}`];

export default function Menu() {
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
    <section id="menu" className={s.section} ref={sectionRef}>
      <div className="container">
        <div className={s.header}>
          <div className={`${s.sectionLabel} ${s.reveal}`}>Collection Exclusive</div>
          <h2 className={`${s.title} ${s.reveal} ${s.delay1}`}>Notre Carte</h2>
          <p className={`${s.subtitle} ${s.reveal} ${s.delay2}`}>
            Quatre créations d'exception, chacune une signature sensorielle
          </p>
        </div>

        <div className={s.grid}>
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              revealClass={delayClasses[i] || s.reveal}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
