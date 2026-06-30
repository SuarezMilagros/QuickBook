import { fetchJSON, authHeader } from './api'

export const adminService = {
  getOperadores: (token) =>
    fetchJSON('/operadores', { headers: authHeader(token) }),

  asignarOperador: (token, reservaId, idOperador) =>
    fetchJSON(`/reservas/${reservaId}/operador`, {
      method: 'PATCH',
      headers: authHeader(token),
      body: JSON.stringify({ id_operador: idOperador }),
    }),

  getComentarios: (token, reservaId) =>
    fetchJSON(`/reservas/${reservaId}/comentarios`, { headers: authHeader(token) }),

  agregarComentario: (token, reservaId, texto) =>
    fetchJSON(`/reservas/${reservaId}/comentarios`, {
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify({ texto }),
    }),
}