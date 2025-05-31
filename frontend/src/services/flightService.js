import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export function getFlights(params) {
  return axios.get(`${API_URL}/flights`, { params })
}
