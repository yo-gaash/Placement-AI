import api from './api'

export const resumeService = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getLatest: () => api.get('/resume/me/latest'),
  getAll: () => api.get('/resume/me/all'),
}
