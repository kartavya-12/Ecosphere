import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Activities from './pages/Activities';
import Dashboard from './pages/Dashboard';
import './styles/index.css';

function AppLayout() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const location = useLocation();

  // Dashboard and sub-pages have their own header
  const showMainHeader = location.pathname === '/' ;

  return (
    <>
      <Preloader />
      {showMainHeader && (
        <Header onOpenLogin={() => setIsLoginOpen(true)} />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      {showMainHeader && <Footer />}

      <AuthModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}


