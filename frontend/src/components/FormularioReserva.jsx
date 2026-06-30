import { useState } from 'react'
import { reservasService } from '../services/reservasService'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function FormularioReserva({ turnoSeleccionado, servicioId, onReservaExitosa, onVolver }) {
  const [campos,  setCampos]  = useState({ nombre_cliente: '', email: '', telefono: '' })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando]   = useState(false)
  const [errorApi, setErrorApi]   = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCampos(p => ({ ...p, [name]: value }))
    if (errores[name]) setErrores(p => ({ ...p, [name]: null }))
  }

  const validar = () => {
    const e = {}
    if (!campos.nombre_cliente.trim()) e.nombre_cliente = 'El nombre es obligatorio.'
    if (!EMAIL_RE.test(campos.email))  e.email = 'El formato del email no es válido.'
    if (!campos.telefono.trim())       e.telefono = 'El teléfono es obligatorio.'
    if (!turnoSeleccionado)            e.turno = 'Seleccioná un turno en el calendario.'
    return e
  }

  const confirmar = async () => {
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }
    setEnviando(true); setErrorApi(null)
    try {
      const res = await reservasService.crearReserva({
        ...campos,
        servicio_id: servicioId,
        fecha_hora: `${turnoSeleccionado.fecha}T${turnoSeleccionado.hora}:00`,
      })
      onReservaExitosa?.(res)
    } catch (err) {
      setErrorApi(err.status === 409 ? 'El turno ya fue reservado. Elegí otro horario.' : 'Error inesperado. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
      <button onClick={onVolver} className="text-sm text-blue-500 hover:underline mb-4 block">← Cambiar turno</button>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Completar reserva</h2>

      {turnoSeleccionado && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700 font-medium">
          📅 {turnoSeleccionado.fecha} · ⏰ {turnoSeleccionado.hora}
        </div>
      )}
      {errores.turno && <p className="text-red-500 text-xs mb-3">{errores.turno}</p>}

      {[
        { label: 'Nombre completo', name: 'nombre_cliente', type: 'text', placeholder: 'Ej: Milagros Suarez' },
        { label: 'Email',           name: 'email',          type: 'email', placeholder: 'milagros@email.com' },
        { label: 'Teléfono',        name: 'telefono',       type: 'text', placeholder: '1123456789' },
      ].map(({ label, name, type, placeholder }) => (
        <div key={name} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            name={name} type={type} value={campos[name]}
            onChange={handleChange} placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition focus:ring-2
              ${errores[name] ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
          />
          {errores[name] && <p className="text-red-500 text-xs mt-1">{errores[name]}</p>}
        </div>
      ))}

      {errorApi && <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-600 text-sm">{errorApi}</div>}

      <button
        onClick={confirmar} disabled={enviando}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-colors"
      >
        {enviando ? 'Confirmando...' : 'Confirmar reserva'}
      </button>
    </div>
  )
}