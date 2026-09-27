import api from './api';

export const executionsService = {
  executeTestCase: (tcId, data) => api.post(`/test-cases/${tcId}/execute`, data),
};
