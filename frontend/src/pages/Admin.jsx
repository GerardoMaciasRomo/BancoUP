import { useEffect, useState } from 'react'
import api from '../services/api'

function fmtDate(iso) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtAccount(num) {
  return num ? num.match(/.{1,4}/g).join(' ') : num
}

export default function Admin() {
  const [tab, setTab]             = useState('blocked')
  const [blocked, setBlocked]     = useState([])
  const [logs, setLogs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [unlocking, setUnlocking] = useState(null)
  const [message, setMessage]     = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const [b, l] = await Promise.all([
        api.get('/admin/blocked-users'),
        api.get('/admin/audit-log'),
      ])
      setBlocked(b.data)
      setLogs(l.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleUnblock(userId, email) {
    setUnlocking(userId)
    setMessage('')
    try {
      await api.post(`/admin/unblock/${userId}`)
      setMessage(`✅ Cuenta de ${email} desbloqueada`)
      loadData()
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.detail || 'Error al desbloquear'}`)
    } finally {
      setUnlocking(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-bbva-navy border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-bbva-navy rounded-xl flex items-center justify-center text-white text-lg">🛡️</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Administrador</h1>
          <p className="text-gray-500 text-sm">Gestión de cuentas y auditoría del sistema</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">{blocked.length}</p>
          <p className="text-sm text-gray-400 mt-1">Cuentas bloqueadas</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-orange-500">{logs.length}</p>
          <p className="text-sm text-gray-400 mt-1">Intentos fallidos registrados</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 text-sm rounded-lg px-4 py-3 ${message.startsWith('✅') ? 'success-box' : 'error-box'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 mb-4 border-b border-gray-200">
        {[['blocked', `🔒 Cuentas bloqueadas (${blocked.length})`], ['logs', `📋 Log de auditoría (${logs.length})`]].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === v
                ? 'border-bbva-navy text-bbva-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Blocked users */}
      {tab === 'blocked' && (
        blocked.length === 0 ? (
          <div className="card text-center py-14 text-gray-400">
            <span className="text-5xl block mb-3">✅</span>
            <p className="font-medium">No hay cuentas bloqueadas</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Usuario</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Correo</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Cuenta</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {blocked.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{u.full_name}</td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3 font-mono text-gray-500">{fmtAccount(u.account_number)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleUnblock(u.id, u.email)}
                        disabled={unlocking === u.id}
                        className="btn-sm"
                      >
                        {unlocking === u.id ? 'Desbloqueando...' : 'Desbloquear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Audit log */}
      {tab === 'logs' && (
        logs.length === 0 ? (
          <div className="card text-center py-14 text-gray-400">
            <p className="font-medium">Sin intentos fallidos registrados</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Correo</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Motivo</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Fecha y hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400">{l.id}</td>
                    <td className="px-5 py-3 text-gray-700">{l.email}</td>
                    <td className="px-5 py-3 text-gray-500">{l.reason}</td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{fmtDate(l.attempted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
