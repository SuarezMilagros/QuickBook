import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

export default function FormularioAuth() {
  const { guardarSesion } = useAuth()
  const [tab,    setTab]    = useState('login')
  const [campos, setCampos] = useState({ nombre: '', email: '', password: '', rol: 'Cliente' })
  const [errores, setErrores] = useState({})
  const [errorApi, setErrorApi] = useState(null)
  const [cargando, setCargando] = useState(false)

  const validar = () => {
    const e = {}
    if (tab === 'registro' && !campos.nombre.trim()) e.nombre = 'El nombre es obligatorio.'
    if (!EMAIL_RE.test(campos.email)) e.email = 'Email inválido.'
    if (campos.password.length < 6)  e.password = 'Mínimo 6 caracteres.'
    return e
  }

  const submit = async () => {
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }
    setCargando(true); setErrorApi(null)
    try {
      if (tab === 'registro') await authService.register(campos.nombre, campos.email, campos.password, campos.rol)
      const data = await authService.login(campos.email, campos.password)
      guardarSesion(data.token, data.usuario)
    } catch (err) {
      setErrorApi(err.message || 'Error del servidor.')
    } finally { setCargando(false) }
  }

  const campo = (label, name, type = 'text', placeholder = '') => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name} type={type} value={campos[name]} placeholder={placeholder}
        onChange={e => { setCampos(p => ({ ...p, [name]: e.target.value })); if (errores[name]) setErrores(p => ({ ...p, [name]: null })) }}
        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 transition
          ${errores[name] ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
      />
      {errores[name] && <p className="text-red-500 text-xs mt-1">{errores[name]}</p>}
    </div>
  )

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
        {['login', 'registro'].map(t => (
          <button key={t} onClick={() => { setTab(t); setErrores({}); setErrorApi(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
            {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {tab === 'registro' && campo('Nombre completo', 'nombre', 'text', 'Tu nombre')}
        {campo('Email', 'email', 'email', 'tu@email.com')}
        {campo('Contraseña', 'password', 'password', 'Mínimo 6 caracteres')}
        {tab === 'registro' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select value={campos.rol} onChange={e => setCampos(p => ({ ...p, rol: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500">
              <option value="Cliente">Cliente</option>
              <option value="Operador">Operador</option>
            </select>
          </div>
        )}
        {errorApi && <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-600 text-sm">{errorApi}</div>}
        <button onClick={submit} disabled={cargando}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-colors">
          {cargando ? 'Procesando...' : tab === 'login' ? 'Ingresar' : 'Registrarme'}
        </button>
      </div>
    </div>
  )
}