import api from './api'

export const codingService = {
  getProblems: () => api.get('/coding/me'),
  addProblem: (data) => api.post('/coding/add', data),
  updateStatus: (id, status) => api.put(`/coding/${id}/status`, null, { params: { status } }),
  getRecommendations: () => api.get('/coding/recommendations'),
  getTodaysPlan: () => api.get('/coding/today-plan'),
}
