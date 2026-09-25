import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <Link to={isAdmin() ? '/admin/dashboard' : '/dashboard'} style={{ textDecoration: 'none' }}>
        <span className="navbar-brand">⟨/⟩ CodeExam</span>
      </Link>

      <div className="nav-links">
        {isAdmin() ? (
          <>
            <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>Dashboard</Link>
            <Link to="/admin/create-exam" className={isActive('/admin/create-exam')}>Create Exam</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={isActive('/dashboard')}>Exams</Link>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</span>
            <span className={`badge ${isAdmin() ? 'badge-hard' : 'badge-easy'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
