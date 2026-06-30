import { fetchJSON, authHeader } from './api'

export const authService = {
  register: (nombre, email, password, rol) =>
    fetchJSON('/auth/register', { method: 'POST', body: JSON.stringify({ nombre, email, password, rol }) }),

  login: (email, password) =>
    fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getPerfil: (token) =>
    fetchJSON('/auth/perfil', { headers: authHeader(token) }),
}