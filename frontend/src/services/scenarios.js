import api from './api';

export const scenariosService = {
  getScenariosByReq: (reqId) => api.get(`/requirements/${reqId}/scenarios`),
  generateScenariosAI: (reqId) => api.post(`/requirements/${reqId}/generate-scenarios`),
};
