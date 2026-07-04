import api from './api'

export const interviewService = {
  start: (data) => api.post('/interview/start', data),
  submitAnswer: (data) => api.post('/interview/answer', data),
  getHistory: () => api.get('/interview/history'),
  getHistoryByType: (type) => api.get(`/interview/history/${type}`),
}
