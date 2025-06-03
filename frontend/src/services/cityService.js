import axios from 'axios';

export function getCities() {
  return axios.get('/api/cities');
}