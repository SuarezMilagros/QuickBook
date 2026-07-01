import { fetchJSON } from './api'

export const reservasService = {
  crearReserva: (payload) =>
    fetchJSON('/reservas', { method: 'POST', body: JSON.stringify(payload) }),

  getMisReservas: (email) =>
    fetchJSON(`/reservas/mis-reservas?email=${encodeURIComponent(email)}`),

  getReservaPorCodigo: (codigo) =>
    fetchJSON(`/reservas/${codigo}`),
}