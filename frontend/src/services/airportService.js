import axios from 'axios';

export function getAirportsByCity(cityId) {
  return axios.get(`/api/airports/by-city/${cityId}`);
}