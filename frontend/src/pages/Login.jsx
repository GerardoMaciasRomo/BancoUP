import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[90vh] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-bbva-navy flex-col justify-center items-center p-12 text-white">
        <div className="bg-white text-bbva-navy font-extrabold text-2xl px-4 py-2 rounded-lg mb-8">
          BANCO UP
        </div>
        <h1 className="text-3xl font-bold text-center leading-tight">
          Banca en línea<br />segura y confiable
        </h1>
        <p className="text-blue-200 mt-4 text-center max-w-xs">
          Realiza transferencias inmediatas y consulta tu historial desde cualquier lugar.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-xs">
          {[
            ['$500', 'Monto mínimo'],
            ['$7,000', 'Monto máximo'],
            ['Inmediatas', 'Transferencias'],
            ['24/7', 'Disponibilidad'],
          ].map(([v, l]) => (
            <div key={l} className="bg-white/10 rounded-xl p-4 text-center">
              <p className="font-bold text-bbva-sky text-lg">{v}</p>
              <p className="text-xs text-blue-200 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-block bg-bbva-navy text-white font-extrabold text-xl px-4 py-2 rounded-lg">
              BANCO UP
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Bienvenido</h2>
          <p className="text-gray-500 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          {error && <div className="error-box mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                className="input"
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="Tu contraseña"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-bbva-navy font-semibold hover:underline">
              Regístrate
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">Cuentas de prueba:</p>
            <p>cliente1@bancoup.mx / Test1!</p>
            <p>admin@bancoup.mx / Admin1!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
