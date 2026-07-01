import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { reservasService } from '../services/reservasService'
import PanelAdmin       from '../components/PanelAdmin'
import PanelComentarios from '../components/PanelComentarios'

export default function PageAdmin() {
  const { esAdmin, usuario } = useAuth()
  const [reservas,  setReservas]  = useState([])
  const [expandida, setExpandida] = useState(null)

  useEffect(() => {
    if (esAdmin) {
      reservasService.getMisReservas('admin@qb.com')
        .then(d => setReservas(d.reservas))
        .catch(() => {})
    }
  }, [esAdmin])

  if (!esAdmin) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
      🔒 Acceso solo para administradores. Iniciá sesión con una cuenta Admin.
    </div>
  )

  return (
    <div>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
        🛡️ Panel de administración — Sprint 2
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Gestión de reservas</h2>
      {reservas.length === 0
        ? <p className="text-center text-gray-400 text-sm py-8">No hay reservas aún. Creá una desde la pestaña Reservar.</p>
        : reservas.map(r => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-800 text-sm">#{r.id} — {r.fecha_hora}</p>
                <p className="text-xs text-gray-400 mt-0.5">Código: <span className="font-mono">{r.codigo_verificacion}</span></p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">{r.estado}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setExpandida(expandida === `op-${r.id}` ? null : `op-${r.id}`)}
                className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                👤 Asignar operador
              </button>
              <button onClick={() => setExpandida(expandida === `com-${r.id}` ? null : `com-${r.id}`)}
                className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                📝 Notas
              </button>
            </div>
            {expandida === `op-${r.id}`  && <div className="mt-3"><PanelAdmin      reservaId={r.id} /></div>}
            {expandida === `com-${r.id}` && <div className="mt-3"><PanelComentarios reservaId={r.id} /></div>}
          </div>
        ))}
    </div>
  )
}