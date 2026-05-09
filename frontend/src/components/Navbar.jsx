import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const active = (path) =>
    pathname === path
      ? 'text-white border-b-2 border-bbva-sky pb-0.5'
      : 'text-blue-200 hover:text-white transition-colors'

  return (
    <nav className="bg-bbva-navy shadow-lg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/login'} className="flex items-center gap-2">
            <div className="bg-white text-bbva-navy font-extrabold text-xs px-2 py-1 rounded">
              BANCO UP
            </div>
          </Link>

          {/* Links */}
          {user && (
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link to="/dashboard" className={active('/dashboard')}>Inicio</Link>
              <Link to="/transfer"  className={active('/transfer')}>Transferir</Link>
              <Link to="/history"   className={active('/history')}>Historial</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className={active('/admin')}>Admin</Link>
              )}
            </div>
          )}

          {/* User / logout */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-blue-200 text-sm hidden sm:block">
                {user.full_name.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
