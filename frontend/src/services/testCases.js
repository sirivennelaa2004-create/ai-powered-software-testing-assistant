import api from './api';

export const testCasesService = {
  getTestCases: (params = {}) => api.get('/test-cases', { params }),
  getTestCaseById: (id) => api.get(`/test-cases/${id}`),
  createTestCase: (data) => api.post('/test-cases', data),
  updateTestCase: (id, data) => api.put(`/test-cases/${id}`, data),
  deleteTestCase: (id) => api.delete(`/test-cases/${id}`),
  analyzeQuality: (id) => api.post(`/test-cases/${id}/analyze-quality`),
  getExecutions: (id) => api.get(`/test-cases/${id}/executions`),
};
