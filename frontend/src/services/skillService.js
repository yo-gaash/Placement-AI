import api from './api'

export const skillService = {
  getSkills: () => api.get('/skills/me'),
  addSkill: (data) => api.post('/skills/add', data),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
  analyzeGap: (data) => api.post('/skills/gap-analysis', data),
}
