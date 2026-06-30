import { fetchJSON } from './api'

export const disponibilidadService = {
  getDisponibilidad: (fecha, servicioId) =>
    fetchJSON(`/disponibilidad?fecha=${fecha}&servicio_id=${servicioId}`),
}