import api from './api'

export const communicationService = {
  evaluateSpeech: (speechText) => api.post('/communication/evaluate', { speechText }),
}
