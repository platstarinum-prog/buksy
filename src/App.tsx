import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CartProvider } from './store/CartContext';
import './i18n/i18n';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { LogoAnimation } from './components/LogoAnimation';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { InfoPage } from './pages/InfoPage';
import { EditorialPage } from './pages/EditorialPage';

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <HomePage />
            </PageWrapper>
          }
        />
        <Route
          path="/shop"
          element={
            <PageWrapper>
              <ShopPage />
            </PageWrapper>
          }
        />
        <Route
          path="/product/:slug"
          element={
            <PageWrapper>
              <ProductPage />
            </PageWrapper>
          }
        />
        <Route
          path="/about"
          element={
            <PageWrapper>
              <AboutPage />
            </PageWrapper>
          }
        />
        <Route
          path="/editorial"
          element={
            <PageWrapper>
              <EditorialPage />
            </PageWrapper>
          }
        />
        <Route
          path="/contact"
          element={
            <PageWrapper>
              <ContactPage />
            </PageWrapper>
          }
        />
        <Route
          path="/cart"
          element={
            <PageWrapper>
              <CartPage />
            </PageWrapper>
          }
        />
        <Route
          path="/checkout"
          element={
            <PageWrapper>
              <CheckoutPage />
            </PageWrapper>
          }
        />
        <Route
          path="/:slug"
          element={
            <PageWrapper>
              <InfoPage />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  // Check if we've already shown the intro this session
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('buksy_intro_seen');
    if (hasSeenIntro) {
      setShowIntro(false);
      setIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('buksy_intro_seen', 'true');
    setShowIntro(false);
    setIntroComplete(true);
  };

  if (showIntro) {
    return <LogoAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <CartProvider>
        <div className="flex flex-col min-h-screen bg-noir">
          <Header />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </CartProvider>
  );
}

export default function AppWithRouter() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
