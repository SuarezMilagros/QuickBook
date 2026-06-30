import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import PageReservar    from './pages/PageReservar'
import PageMisReservas from './pages/PageMisReservas'
import PageAuth        from './pages/PageAuth'
import PageAdmin       from './pages/PageAdmin'

const TABS = [
  { id: 'reservar',     label: '📅 Reservar' },
  { id: 'mis-reservas', label: '📋 Mis reservas' },
  { id: 'cuenta',       label: '👤 Mi cuenta' },
  { id: 'admin',        label: '🛡️ Admin', soloAdmin: true },
]

export default function App() {
  const { usuario, esAdmin } = useAuth()
  const [tab, setTab] = useState('reservar')

  const tabs = TABS.filter(t => !t.soloAdmin || esAdmin)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-600">⚡ QuickBook</h1>
            <p className="text-xs text-gray-400">Reservas Online</p>
          </div>
          {usuario && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{usuario.nombre}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                ${usuario.rol === 'Admin' ? 'bg-red-100 text-red-700' : usuario.rol === 'Operador' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                {usuario.rol}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                ${tab === t.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'reservar'     && <PageReservar    onVerMisReservas={() => setTab('mis-reservas')} />}
        {tab === 'mis-reservas' && <PageMisReservas />}
        {tab === 'cuenta'       && <PageAuth />}
        {tab === 'admin'        && <PageAdmin />}
      </div>
    </div>
  )
}