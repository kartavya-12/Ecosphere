import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header({ onOpenLogin }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleLoginClick() {
    if (user) {
      navigate('/dashboard');
    } else {
      onOpenLogin();
    }
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <header>
      <h1 id="brand-logo">
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          EcoSphere
          <span className="css-leaf leaf-1"></span>
          <span className="css-leaf leaf-2"></span>
          <span className="css-leaf leaf-3"></span>
        </Link>
      </h1>

      <nav>
        <Link to="/">Home</Link>
        <a href="#ecosystems" onClick={(e) => { e.preventDefault(); scrollToSection('ecosystems'); }}>Ecosystems</a>
        <a href="#volunteer" onClick={(e) => { e.preventDefault(); scrollToSection('volunteer'); }}>Volunteer</a>
        <a href="#report" onClick={(e) => { e.preventDefault(); scrollToSection('report'); }}>Report</a>
        <a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }}>Gallery</a>
        <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}>Testimonials</a>
        <Link to="/dashboard">Dashboard</Link>
        <button id="navLoginBtn" onClick={handleLoginClick}>
          {user ? user.name : 'Login / API'}
        </button>
      </nav>
    </header>
  );
}
