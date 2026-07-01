import { useAuth } from '../context/AuthContext'
import FormularioAuth from '../components/FormularioAuth'

const COLORES = { Admin: 'bg-red-100 text-red-700', Operador: 'bg-yellow-100 text-yellow-700', Cliente: 'bg-blue-100 text-blue-700' }

export default function PageAuth() {
  const { usuario, cerrarSesion } = useAuth()

  if (usuario) return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-blue-600 text-xl font-bold">
            {usuario.nombre.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
          </span>
        </div>
        <p className="font-semibold text-gray-800 text-lg">{usuario.nombre}</p>
        <p className="text-gray-400 text-sm mt-1">{usuario.email}</p>
        <span className={`inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full ${COLORES[usuario.rol] || 'bg-gray-100 text-gray-500'}`}>
          {usuario.rol}
        </span>
        <button onClick={cerrarSesion} className="mt-4 w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl border border-red-200 transition-colors">
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return <FormularioAuth />
}