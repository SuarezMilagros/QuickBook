import { useState, useEffect } from 'react'
import { disponibilidadService } from '../services/disponibilidadService'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['Do','Lu','Ma','Mi','Ju','Vi','Sa']

export default function CalendarioDisponibilidad({ servicioId, onTurnoSeleccionado }) {
  const hoy = new Date()
  const [mes,    setMes]    = useState(hoy.getMonth())
  const [anio,   setAnio]   = useState(hoy.getFullYear())
  const [fecha,  setFecha]  = useState(null)
  const [turnos, setTurnos] = useState([])
  const [turnoSel, setTurnoSel] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!fecha) return
    setCargando(true)
    setError(null)
    disponibilidadService.getDisponibilidad(fecha, servicioId)
      .then(d => setTurnos(d.turnos_disponibles))
      .catch(() => setError('No se pudo cargar la disponibilidad.'))
      .finally(() => setCargando(false))
  }, [fecha, servicioId])

  const cambiarMes = (dir) => {
    let m = mes + dir, a = anio
    if (m < 0)  { m = 11; a-- }
    if (m > 11) { m = 0;  a++ }
    setMes(m); setAnio(a); setFecha(null); setTurnos([]); setTurnoSel(null)
  }

  const diasDelMes = new Date(anio, mes + 1, 0).getDate()
  const primerDia  = new Date(anio, mes, 1).getDay()
  const hoyStr     = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`

  const selFecha = (d) => {
    const f = `${anio}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    setFecha(f); setTurnoSel(null)
  }

  const selTurno = (hora) => {
    setTurnoSel(hora)
    onTurnoSeleccionado?.({ fecha, hora })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => cambiarMes(-1)} className="p-2 rounded-lg hover:bg-gray-100">‹</button>
        <span className="font-semibold text-gray-800">{MESES[mes]} {anio}</span>
        <button onClick={() => cambiarMes(1)}  className="p-2 rounded-lg hover:bg-gray-100">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS.map(d => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array(primerDia).fill(null).map((_, i) => <div key={i} />)}
        {Array.from({ length: diasDelMes }, (_, i) => i + 1).map(d => {
          const fs = `${anio}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
          const past = fs < hoyStr
          return (
            <button
              key={d}
              disabled={past}
              onClick={() => selFecha(d)}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors
                ${past ? 'text-gray-300 cursor-not-allowed' : ''}
                ${fs === fecha ? 'bg-blue-600 text-white' : !past ? 'hover:bg-blue-50 text-gray-700' : ''}
                ${fs === hoyStr && fs !== fecha ? 'border border-blue-400 text-blue-600' : ''}`}
            >{d}</button>
          )
        })}
      </div>

      {fecha && (
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Turnos para el {fecha}</p>
          {cargando && <p className="text-center text-gray-400 text-sm">Cargando...</p>}
          {error   && <p className="text-center text-red-500 text-sm">{error}</p>}
          {!cargando && !error && (
            <div className="grid grid-cols-3 gap-2">
              {turnos.map(t => (
                <button
                  key={t.hora}
                  disabled={!t.disponible}
                  onClick={() => selTurno(t.hora)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors
                    ${t.disponible
                      ? turnoSel === t.hora
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                      : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed line-through'}`}
                >
                  {t.hora}
                  <span className="block text-xs">{t.disponible ? 'Libre' : 'Ocupado'}</span>
                </button>
              ))}
              {turnos.length === 0 && <p className="col-span-3 text-center text-gray-400 text-sm py-3">Sin turnos para este día.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}