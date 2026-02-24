import { useState } from 'react';
import { useScrollProgress } from './hooks/useScrollProgress';

import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Menu from './components/Menu/Menu';
import WhyUs from './components/WhyUs/WhyUs';
import Footer from './components/Footer/Footer';
import LoginModal from './components/Modal/LoginModal';
import InternalModal from './components/Modal/InternalModal';

import s from './App.module.css';

export default function App() {
  const { progress, scrolled } = useScrollProgress();
  const [modal, setModal] = useState(null); // 'login' | 'internal' | null

  const openLogin    = () => setModal('login');
  const openInternal = () => setModal('internal');
  const closeModal   = () => setModal(null);

  return (
    <div className={s.app}>
      {/* Decorative background orbs */}
      <div className={s.bgOrbs} aria-hidden="true">
        <div className={`${s.orb} ${s.orb1}`} />
        <div className={`${s.orb} ${s.orb2}`} />
        <div className={`${s.orb} ${s.orb3}`} />
      </div>

      {/* Scroll progress bar */}
      <div
        className={s.scrollProgress}
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      {/* Navigation */}
      <Navbar
        scrolled={scrolled}
        onLoginClick={openLogin}
        onInternalClick={openInternal}
      />

      {/* Page sections */}
      <main>
        <Hero />
        <About />
        <Menu />
        <WhyUs onLoginClick={openLogin} onInternalClick={openInternal} />
      </main>

      <Footer onLoginClick={openLogin} onInternalClick={openInternal} />

      {/* Modals */}
      <LoginModal    isOpen={modal === 'login'}    onClose={closeModal} />
      <InternalModal isOpen={modal === 'internal'} onClose={closeModal} />
    </div>
  );
}
