import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import logo from '../assets/logo.png';

const LINKS = [
  { to: '/dashboard',   label: 'Dashboard',   roles: ['ADMIN', 'AGENT'] },
  { to: '/emergencies', label: 'Alertes SOS',  roles: ['ADMIN', 'AGENT'] },
  { to: '/map',         label: 'Carte',        roles: ['ADMIN', 'AGENT'] },
  { to: '/types',       label: 'Types',        roles: ['ADMIN'] },
];

export default function Navbar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { theme, toggle } = useTheme();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = localStorage.getItem('role') || 'AGENT';
  const initials = user.full_name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD';
  const dark = theme === 'dark';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav style={{
      background: dark ? '#111' : 'white',
      borderBottom: `1px solid ${dark ? '#1A1A1A' : '#E5E5E5'}`,
      padding: '0 1.5rem',
      height: '58px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'background 0.3s, border 0.3s',
    }}>

      {/* ── Logo + Liens ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img
            src={logo}
            alt="SOS Campus"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 0 12px rgba(255,0,0,0.4)',
              animation: 'navpulse 2s ease infinite',
            }}
          />
          <span style={{ fontWeight: 700, fontSize: '16px', color: dark ? 'white' : '#111' }}>
            SOS Campus
          </span>
        </Link>

        {/* Liens filtrés selon le rôle */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {LINKS.filter(link => link.roles.includes(role)).map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} style={{
                color: active ? (dark ? 'white' : '#111') : (dark ? '#555' : '#999'),
                textDecoration: 'none',
                fontSize: '13px',
                padding: '6px 14px',
                borderRadius: '6px',
                background: active ? (dark ? '#1A1A1A' : '#F0F0F0') : 'transparent',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.2s',
              }}>{label}</Link>
            );
          })}
        </div>
      </div>

      {/* ── Droite : thème + user + logout ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Toggle thème */}
        <button onClick={toggle} style={{
          background: dark ? '#1A1A1A' : '#F0F0F0',
          border: `1px solid ${dark ? '#333' : '#E5E5E5'}`,
          color: dark ? '#888' : '#666',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 500,
          transition: 'all 0.2s',
        }}>
          {dark ? '☀️' : '🌙'} {dark ? 'Mode clair' : 'Mode sombre'}
        </button>

        {/* Badge rôle */}
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: '20px',
          background: role === 'ADMIN' ? '#7C3AED20' : '#05996920',
          color: role === 'ADMIN' ? '#7C3AED' : '#059669',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {role === 'ADMIN' ? 'Admin' : 'Agent'}
        </span>

        {/* Nom utilisateur */}
        <span style={{ fontSize: '12px', color: dark ? '#444' : '#bbb' }}>
          {user.full_name}
        </span>

        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#FF0000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: 'white',
        }}>
          {initials}
        </div>

        {/* Déconnexion */}
        <button onClick={logout} style={{
          background: 'transparent',
          border: `1px solid ${dark ? '#1A1A1A' : '#E5E5E5'}`,
          color: dark ? '#555' : '#999',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}>
          Déconnexion
        </button>
      </div>

      <style>{`
        @keyframes navpulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,0,0,0.4); }
          70% { box-shadow: 0 0 0 8px rgba(255,0,0,0); }
        }
      `}</style>
    </nav>
  );
}