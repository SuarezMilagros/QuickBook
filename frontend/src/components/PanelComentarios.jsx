import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminService } from '../services/adminService'

export default function PanelComentarios({ reservaId }) {
  const { esOperador, token } = useAuth()
  const [comentarios, setComentarios] = useState([])
  const [texto,       setTexto]       = useState('')
  const [error,       setError]       = useState(null)
  const [enviando,    setEnviando]    = useState(false)

  useEffect(() => {
    if (esOperador) adminService.getComentarios(token, reservaId).then(setComentarios).catch(() => {})
  }, [token, reservaId, esOperador])

  if (!esOperador) return (
    <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-400 text-center">
      🔒 Notas internas solo visibles para operadores y administradores.
    </div>
  )

  const agregar = async () => {
    const t = texto.trim()
    if (!t)         { setError('El comentario no puede estar vacío.'); return }
    if (t.length > 500) { setError('Máximo 500 caracteres.'); return }
    setEnviando(true); setError(null)
    try {
      const res = await adminService.agregarComentario(token, reservaId, t)
      setComentarios(p => [...p, res.comentario]); setTexto('')
    } catch (err) {
      setError(err.message || 'Error al guardar.')
    } finally { setEnviando(false) }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">📝 Notas internas</p>
      <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
        {comentarios.length === 0
          ? <p className="text-xs text-gray-400 text-center py-2">Sin notas aún.</p>
          : comentarios.map((c, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-800">{c.texto}</p>
              <p className="text-xs text-gray-400 mt-1">{c.autor} · {c.creado_en}</p>
            </div>
          ))}
      </div>
      <textarea
        value={texto} onChange={e => { setTexto(e.target.value); setError(null) }}
        placeholder="Escribí una nota interna... (máx. 500 caracteres)"
        rows={3}
        className={`w-full px-3 py-2 border rounded-lg text-sm resize-none outline-none focus:ring-2 transition
          ${error ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
      />
      <div className="flex justify-between items-center mt-1 mb-2">
        {error ? <p className="text-red-500 text-xs">{error}</p> : <span />}
        <span className={`text-xs ${texto.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>{texto.length}/500</span>
      </div>
      <button onClick={agregar} disabled={enviando}
        className="w-full py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg">
        {enviando ? 'Guardando...' : 'Agregar nota'}
      </button>
    </div>
  )
}