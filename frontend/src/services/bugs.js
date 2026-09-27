import api from './api';

export const bugsService = {
  getBugs: (params = {}) => api.get('/bugs', { params }),
  getBugById: (id) => api.get(`/bugs/${id}`),
  createBug: (data) => api.post('/bugs', data),
  updateBug: (id, data) => api.put(`/bugs/${id}`, data),
  deleteBug: (id) => api.delete(`/bugs/${id}`),
  analyzeBug: (id) => api.post(`/bugs/${id}/analyze`),
  getAnalyses: (id) => api.get(`/bugs/${id}/analyses`),
};
