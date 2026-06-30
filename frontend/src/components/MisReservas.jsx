import { useState } from 'react'
import { reservasService } from '../services/reservasService'

const COLORES = { Confirmada: 'bg-green-100 text-green-700', Cancelada: 'bg-red-100 text-red-700', Pendiente: 'bg-yellow-100 text-yellow-700' }

export default function MisReservas({ emailInicial = '' }) {
  const [email,    setEmail]    = useState(emailInicial)
  const [reservas, setReservas] = useState([])
  const [cliente,  setCliente]  = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState(null)

  const buscar = async () => {
    if (!email.trim()) return
    setCargando(true); setError(null)
    try {
      const d = await reservasService.getMisReservas(email.trim())
      setReservas(d.reservas); setCliente(d.cliente)
    } catch (err) {
      setError(err.status === 404 ? 'No se encontró cuenta con ese email.' : 'Error al cargar reservas.')
      setReservas([]); setCliente(null)
    } finally { setCargando(false) }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex gap-2">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Ingresá tu email"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <button onClick={buscar} disabled={cargando} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:bg-blue-300">
            {cargando ? '...' : 'Buscar'}
          </button>
        </div>
      </div>

      {error && <p className="text-center text-red-500 text-sm py-4">{error}</p>}

      {!cargando && !error && cliente && (
        <>
          <p className="text-sm text-gray-500 mb-3">Turnos de <strong>{cliente}</strong> · {reservas.length} registro(s)</p>
          {reservas.length === 0
            ? <p className="text-center text-gray-400 text-sm py-6">No tenés reservas aún.</p>
            : reservas.map(r => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.fecha_hora}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Código: <span className="font-mono font-medium">{r.codigo_verificacion}</span></p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLORES[r.estado] || 'bg-gray-100 text-gray-500'}`}>{r.estado}</span>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  )
}