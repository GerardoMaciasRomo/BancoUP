import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function fmt(v) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v)
}

function fmtAccount(num) {
  return num ? num.match(/.{1,4}/g).join(' ') : ''
}

export default function Transfer() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ receiver_account: '', amount: '', concept: '' })
  const [step, setStep] = useState('form')   // form | confirm | success | error
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function validateForm() {
    if (!/^\d{16}$/.test(form.receiver_account)) {
      setError('El número de cuenta debe tener exactamente 16 dígitos numéricos')
      return false
    }
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt < 500 || amt > 7000) {
      setError('El monto debe estar entre $500.00 y $7,000.00 MXN')
      return false
    }
    if (!form.concept.trim()) {
      setError('El concepto es obligatorio')
      return false
    }
    setError('')
    return true
  }

  function handleReview(e) {
    e.preventDefault()
    if (validateForm()) setStep('confirm')
  }

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      await api.post('/transactions/', {
        receiver_account: form.receiver_account,
        amount: parseFloat(form.amount),
        concept: form.concept.trim(),
      })
      await refreshUser()
      setStep('success')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al procesar la transferencia')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Transferencia exitosa!</h2>
        <p className="text-gray-500 mb-2">
          Se transfirieron <span className="font-bold text-gray-800">{fmt(form.amount)}</span>
        </p>
        <p className="text-gray-400 text-sm mb-8">a la cuenta {fmtAccount(form.receiver_account)}</p>
        <div className="flex gap-3">
          <button onClick={() => { setForm({ receiver_account: '', amount: '', concept: '' }); setStep('form') }} className="btn-secondary">
            Nueva transferencia
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Ir al inicio
          </button>
        </div>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Confirmar transferencia</h1>
        <div className="card space-y-4 mb-6">
          {[
            ['Cuenta destino', fmtAccount(form.receiver_account)],
            ['Monto',          fmt(form.amount)],
            ['Concepto',       form.concept],
            ['Tu saldo actual', fmt(user?.balance ?? 0)],
            ['Saldo después',  fmt((user?.balance ?? 0) - parseFloat(form.amount))],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <span className="text-gray-500">{l}</span>
              <span className="font-semibold text-gray-800">{v}</span>
            </div>
          ))}
        </div>

        {error && <div className="error-box mb-4">{error}</div>}

        <div className="flex gap-3">
          <button onClick={() => setStep('form')} className="btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button onClick={handleConfirm} className="btn-primary" disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nueva transferencia</h1>
        <p className="text-gray-500 text-sm mt-1">
          Saldo disponible: <span className="font-semibold text-bbva-navy">{fmt(user?.balance ?? 0)}</span>
        </p>
      </div>

      {(step === 'error' && error) && <div className="error-box mb-5">{error}</div>}

      <div className="card">
        <form onSubmit={handleReview} className="space-y-5">
          <div>
            <label className="label">Número de cuenta destino</label>
            <input
              className="input font-mono tracking-widest"
              type="text"
              inputMode="numeric"
              maxLength={16}
              placeholder="1234567890123456"
              value={form.receiver_account}
              onChange={e => setForm({ ...form, receiver_account: e.target.value.replace(/\D/g, '') })}
              required
            />
            <p className="text-xs text-gray-400 mt-1">16 dígitos numéricos</p>
          </div>

          <div>
            <label className="label">Monto (MXN)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                className="input pl-8"
                type="number"
                step="0.01"
                min="500"
                max="7000"
                placeholder="500.00"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Mínimo $500 — Máximo $7,000</p>
          </div>

          <div>
            <label className="label">Concepto</label>
            <input
              className="input"
              type="text"
              maxLength={200}
              placeholder="Renta, préstamo, compra..."
              value={form.concept}
              onChange={e => setForm({ ...form, concept: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Revisar transferencia →
          </button>
        </form>
      </div>
    </div>
  )
}
