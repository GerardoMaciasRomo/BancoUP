import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function validatePassword(pwd) {
  if (pwd.length < 5 || pwd.length > 8) return 'Entre 5 y 8 caracteres'
  if (!/[A-Z]/.test(pwd)) return 'Al menos una mayúscula'
  if (!/\d/.test(pwd)) return 'Al menos un número'
  if (!/[!@#$%^&*()\-_=+[\]{};:'",.<>?/\\|`~]/.test(pwd)) return 'Al menos un carácter especial'
  return null
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '', full_name: '' })
  const [pwdError, setPwdError] = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    if (k === 'password') setPwdError(validatePassword(e.target.value) || '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const pwdErr = validatePassword(form.password)
    if (pwdErr) { setPwdError(pwdErr); return }
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.password, form.full_name)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-block bg-bbva-navy text-white font-extrabold text-xl px-4 py-2 rounded-lg">
            BANCO UP
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Crear cuenta</h2>
          <p className="text-gray-500 text-sm mt-1">Únete a Banco UP</p>
        </div>

        {error && <div className="error-box mb-4">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input className="input" type="text" placeholder="Ana García López" value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div>
              <label className="label">Correo electrónico</label>
              <input className="input" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" placeholder="5-8 chars, mayús, número, especial" value={form.password} onChange={set('password')} required />
              {pwdError && <p className="text-red-500 text-xs mt-1">{pwdError}</p>}
              <ul className="text-xs text-gray-400 mt-2 space-y-0.5 list-disc list-inside">
                <li>Entre 5 y 8 caracteres</li>
                <li>Al menos una mayúscula, un número y un carácter especial</li>
              </ul>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-bbva-navy font-semibold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
