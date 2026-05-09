import { useEffect, useState } from 'react'
import api from '../services/api'

function fmt(v) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v)
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtAccount(num) {
  return num ? num.match(/.{1,4}/g).join(' ') : num
}

export default function History() {
  const [movements, setMovements] = useState([])
  const [filter, setFilter]       = useState('all')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.get('/transactions/')
      .then(r => setMovements(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all'
    ? movements
    : movements.filter(m => m.direction === filter)

  const totalEnviado  = movements.filter(m => m.direction === 'enviado').reduce((s, m) => s + m.amount, 0)
  const totalRecibido = movements.filter(m => m.direction === 'recibido').reduce((s, m) => s + m.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-bbva-navy border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Historial de movimientos</h1>
      <p className="text-gray-500 text-sm mb-6">Todos tus movimientos, del más reciente al más antiguo</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-bbva-navy">{movements.length}</p>
          <p className="text-xs text-gray-400 mt-1">Total</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{fmt(totalRecibido)}</p>
          <p className="text-xs text-gray-400 mt-1">Recibido</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-600">{fmt(totalEnviado)}</p>
          <p className="text-xs text-gray-400 mt-1">Enviado</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {[['all', 'Todos'], ['enviado', 'Enviados'], ['recibido', 'Recibidos']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === v
                ? 'bg-bbva-navy text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {l}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} movimientos</span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-14 text-gray-400">
          <span className="text-5xl block mb-3">📭</span>
          <p className="font-medium">Sin movimientos</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden divide-y divide-gray-50">
          {filtered.map(m => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0
                ${m.direction === 'recibido' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {m.direction === 'recibido' ? '↓' : '↑'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm capitalize truncate">{m.concept}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {m.direction === 'enviado' ? 'A: ' : 'De: '}
                  <span className="font-mono">{fmtAccount(m.counterpart_account)}</span>
                </p>
              </div>

              {/* Amount + date */}
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-sm ${m.direction === 'recibido' ? 'text-green-600' : 'text-red-600'}`}>
                  {m.direction === 'recibido' ? '+' : '-'}{fmt(m.amount)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{fmtDate(m.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
