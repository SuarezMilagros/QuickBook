import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(() => localStorage.getItem('qb_token') || null)
  const [usuario, setUsuario] = useState(() => {
    const raw = localStorage.getItem('qb_user')
    return raw ? JSON.parse(raw) : null
  })

  const guardarSesion = useCallback((nuevoToken, nuevoUsuario) => {
    localStorage.setItem('qb_token', nuevoToken)
    localStorage.setItem('qb_user', JSON.stringify(nuevoUsuario))
    setToken(nuevoToken)
    setUsuario(nuevoUsuario)
  }, [])

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('qb_token')
    localStorage.removeItem('qb_user')
    setToken(null)
    setUsuario(null)
  }, [])

  const esAdmin    = usuario?.rol === 'Admin'
  const esOperador = usuario?.rol === 'Operador' || usuario?.rol === 'Admin'

  return (
    <AuthContext.Provider value={{ token, usuario, guardarSesion, cerrarSesion, esAdmin, esOperador }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}