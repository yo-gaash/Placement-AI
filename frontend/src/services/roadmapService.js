import api from './api'

export const roadmapService = {
  getRoadmap: () => api.get('/roadmap/me'),
  markComplete: (id, completed) => api.put(`/roadmap/${id}/complete`, null, { params: { completed } }),
  addItem: (data) => api.post('/roadmap/add', data),
}
