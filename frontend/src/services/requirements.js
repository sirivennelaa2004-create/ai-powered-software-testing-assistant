import api from './api';

export const requirementsService = {
  getRequirements: (params = {}) => api.get('/requirements', { params }),
  getRequirementById: (id) => api.get(`/requirements/${id}`),
  createRequirement: (data) => api.post('/requirements', data),
  updateRequirement: (id, data) => api.put(`/requirements/${id}`, data),
  deleteRequirement: (id) => api.delete(`/requirements/${id}`),
  getScenarios: (id) => api.get(`/requirements/${id}/scenarios`),
  getAnalyses: (id) => api.get(`/requirements/${id}/analyses`),
};
