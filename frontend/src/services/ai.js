import api from './api';

export const aiService = {
  analyzeRequirement: (reqId) => api.post(`/requirements/${reqId}/analyze`),
  generateScenarios: (reqId) => api.post(`/requirements/${reqId}/generate-scenarios`),
  generateTestCases: (reqId) => api.post(`/requirements/${reqId}/generate-test-cases`),
  generatePositiveTestCases: (reqId) => api.post(`/requirements/${reqId}/generate-positive-test-cases`),
  generateNegativeTestCases: (reqId) => api.post(`/requirements/${reqId}/generate-negative-test-cases`),
  generateEdgeTestCases: (reqId) => api.post(`/requirements/${reqId}/generate-edge-test-cases`),
  generateBoundaryTestCases: (reqId) => api.post(`/requirements/${reqId}/generate-boundary-test-cases`),
  analyzeBug: (bugId) => api.post(`/bugs/${bugId}/analyze`),
  analyzeTestCaseQuality: (tcId) => api.post(`/test-cases/${tcId}/analyze-quality`),
};
