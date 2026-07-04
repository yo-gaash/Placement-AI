import api from './api'

export const chatService = {
  sendMessage: (data) => api.post('/chat', data),
  getHistory: (agentType) => api.get('/chat/history', { params: agentType ? { agentType } : {} }),
}
