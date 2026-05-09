import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function fmt(amount) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

function fmtAccount(num) {
  return num ? num.match(/.{1,4}/g).join(' ') : '---- ---- ---- ----'
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [, { data }] = await Promise.all([
          refreshUser(),
          api.get('/transactions/'),
        ])
        setMovements(data.slice(0, 5))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-bbva-navy border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Balance card */}
      <div className="relative bg-gradient-to-br from-bbva-dark via-bbva-navy to-bbva-blue rounded-3xl p-7 text-white shadow-xl overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -right-4 w-36 h-36 rounded-full bg-white/5" />

        <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mb-6">Banco UP</p>
        <div className="mb-6">
          <p className="text-blue-200 text-sm">Saldo disponible</p>
          <p className="text-4xl font-bold mt-1 tracking-tight">{fmt(user?.balance ?? 0)}</p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-blue-300 text-xs mb-0.5">Número de cuenta</p>
            <p className="font-mono text-lg tracking-widest">{fmtAccount(user?.account_number)}</p>
          </div>
          <p className="text-blue-200 text-sm">{user?.full_name}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/transfer" className="card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-bbva-navy/10 rounded-xl flex items-center justify-center text-2xl group-hover:bg-bbva-navy/20 transition-colors">
            💸
          </div>
          <div>
            <p className="font-semibold text-gray-800">Transferir</p>
            <p className="text-xs text-gray-400">$500 – $7,000 MXN</p>
          </div>
        </Link>
        <Link to="/history" className="card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-bbva-navy/10 rounded-xl flex items-center justify-center text-2xl group-hover:bg-bbva-navy/20 transition-colors">
            📋
          </div>
          <div>
            <p className="font-semibold text-gray-800">Historial</p>
            <p className="text-xs text-gray-400">Ver movimientos</p>
          </div>
        </Link>
      </div>

      {/* Recent movements */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-800">Últimos movimientos</h2>
          <Link to="/history" className="text-bbva-navy text-sm font-semibold hover:underline">Ver todos →</Link>
        </div>

        {movements.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-2">📭</span>
            <p className="text-sm">Aún no tienes movimientos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {movements.map(m => (
              <div key={m.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                    ${m.direction === 'recibido' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {m.direction === 'recibido' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 capitalize">{m.concept}</p>
                    <p className="text-xs text-gray-400">{fmtDate(m.created_at)}</p>
                  </div>
                </div>
                <p className={`font-bold text-sm ${m.direction === 'recibido' ? 'text-green-600' : 'text-red-600'}`}>
                  {m.direction === 'recibido' ? '+' : '-'}{fmt(m.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
