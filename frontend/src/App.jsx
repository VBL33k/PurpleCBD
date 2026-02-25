import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useScrollProgress } from './hooks/useScrollProgress';

import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Menu from './components/Menu/Menu';
import WhyUs from './components/WhyUs/WhyUs';
import Footer from './components/Footer/Footer';
import LoginModal from './components/Modal/LoginModal';
import InternalModal from './components/Modal/InternalModal';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProtectedRoute from './components/ProtectedRoute';

import s from './App.module.css';

function Vitrine() {
  const { progress, scrolled } = useScrollProgress();
  const [modal, setModal] = useState(null);

  const openLogin    = () => setModal('login');
  const openInternal = () => setModal('internal');
  const closeModal   = () => setModal(null);

  return (
    <div className={s.app}>
      <div className={s.bgOrbs} aria-hidden="true">
        <div className={`${s.orb} ${s.orb1}`} />
        <div className={`${s.orb} ${s.orb2}`} />
        <div className={`${s.orb} ${s.orb3}`} />
      </div>

      <div
        className={s.scrollProgress}
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      <Navbar
        scrolled={scrolled}
        onLoginClick={openLogin}
        onInternalClick={openInternal}
      />

      <main>
        <Hero />
        <About />
        <Menu />
        <WhyUs onLoginClick={openLogin} onInternalClick={openInternal} />
      </main>

      <Footer onLoginClick={openLogin} onInternalClick={openInternal} />

      <LoginModal    isOpen={modal === 'login'}    onClose={closeModal} />
      <InternalModal isOpen={modal === 'internal'} onClose={closeModal} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Vitrine />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/dashboard/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
