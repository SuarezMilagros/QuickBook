import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminService } from '../services/adminService'

export default function PanelAdmin({ reservaId, operadorActualId, onAsignado }) {
  const { esAdmin, token } = useAuth()
  const [operadores, setOperadores] = useState([])
  const [elegido,    setElegido]    = useState(operadorActualId || '')
  const [cargando,   setCargando]   = useState(false)
  const [mensaje,    setMensaje]    = useState(null)

  useEffect(() => {
    if (esAdmin) adminService.getOperadores(token).then(setOperadores).catch(() => {})
  }, [esAdmin, token])

  if (!esAdmin) return (
    <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-400 text-center">
      🔒 Solo disponible para Administradores.
    </div>
  )

  const asignar = async () => {
    if (!elegido) return
    setCargando(true); setMensaje(null)
    try {
      await adminService.asignarOperador(token, reservaId, Number(elegido))
      setMensaje({ ok: true, texto: 'Operador asignado exitosamente.' })
      onAsignado?.()
    } catch (err) {
      setMensaje({ ok: false, texto: err.message || 'Error al asignar.' })
    } finally { setCargando(false) }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">👤 Asignar operador</p>
      <div className="flex gap-2">
        <select value={elegido} onChange={e => setElegido(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500">
          <option value="">-- Seleccionar --</option>
          {operadores.map(op => <option key={op.id} value={op.id}>{op.nombre} ({op.rol})</option>)}
        </select>
        <button onClick={asignar} disabled={cargando || !elegido}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm rounded-lg">
          {cargando ? '...' : 'Asignar'}
        </button>
      </div>
      {mensaje && <p className={`mt-2 text-xs ${mensaje.ok ? 'text-green-600' : 'text-red-600'}`}>{mensaje.texto}</p>}
    </div>
  )
}