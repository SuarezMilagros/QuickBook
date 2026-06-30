const BASE_URL = '/api/v1'

export async function fetchJSON(url, options = {}) {
  const response = await fetch(BASE_URL + url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await response.json()
  if (!response.ok) {
    const error = new Error(data.error || 'Error del servidor')
    error.status = response.status
    throw error
  }
  return data
}

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` })