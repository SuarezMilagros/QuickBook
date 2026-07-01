import { useState } from 'react'
import CalendarioDisponibilidad from '../components/CalendarioDisponibilidad'
import FormularioReserva        from '../components/FormularioReserva'
import PantallaConfirmacion     from '../components/PantallaConfirmacion'

const SERVICIO_ID = 1

export default function PageReservar({ onVerMisReservas }) {
  const [paso,    setPaso]    = useState(1)
  const [turno,   setTurno]   = useState(null)
  const [reserva, setReserva] = useState(null)

  return (
    <div>
      {(paso === 1 || paso === 2) && (
        <div className="flex gap-2 mb-6">
          {['1. Elegir turno', '2. Tus datos'].map((label, i) => (
            <span key={i} className={`text-xs px-3 py-1 rounded-full font-medium
              ${i + 1 === paso ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {label}
            </span>
          ))}
        </div>
      )}

      {paso === 1 && (
        <>
          <CalendarioDisponibilidad servicioId={SERVICIO_ID} onTurnoSeleccionado={t => setTurno(t)} />
          {turno && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center">
              <span className="text-sm text-blue-700">📅 {turno.fecha} · ⏰ {turno.hora}</span>
              <button onClick={() => setPaso(2)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Continuar →</button>
            </div>
          )}
        </>
      )}

      {paso === 2 && (
        <FormularioReserva
          turnoSeleccionado={turno}
          servicioId={SERVICIO_ID}
          onReservaExitosa={r => { setReserva(r); setPaso(3) }}
          onVolver={() => setPaso(1)}
        />
      )}

      {paso === 3 && (
        <PantallaConfirmacion reservaData={reserva} onVerMisReservas={onVerMisReservas} />
      )}
    </div>
  )
}