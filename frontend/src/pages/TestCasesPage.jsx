import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import TestExecutionModal from '../components/TestExecutionModal';
import { CheckSquare, PlayCircle, Search, Filter, Plus } from 'lucide-react';

const TestCasesPage = () => {
  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Execution modal state
  const [selectedTcForExec, setSelectedTcForExec] = useState(null);
  const [isExecModalOpen, setIsExecModalOpen] = useState(false);

  const fetchTestCases = async () => {
    try {
      let queryParams = [];
      if (selectedProject) queryParams.push(`project_id=${selectedProject}`);
      if (selectedPriority) queryParams.push(`priority=${selectedPriority}`);
      if (selectedType) queryParams.push(`test_type=${selectedType}`);
      if (selectedStatus) queryParams.push(`status=${selectedStatus}`);
      if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const response = await api.get(`/test-cases${queryString}`);
      setTestCases(response.data);
    } catch (err) {
      console.error('Failed to fetch test cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTestCases();
  }, [selectedProject, selectedPriority, selectedType, selectedStatus, searchTerm]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Test Case Management & Execution</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Search, filter, and run test case executions</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        {/* Search Input */}
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 0.75rem' }}>
          <Search size={18} style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search test case title or ID..."
            style={{ border: 'none', background: 'transparent' }}
          />
        </div>

        {/* Project Filter */}
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{ flex: '1 1 150px' }}>
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} style={{ flex: '1 1 120px' }}>
          <option value="">All Priorities</option>
          <option value="P0">P0 (Critical)</option>
          <option value="P1">P1 (High)</option>
          <option value="P2">P2 (Medium)</option>
          <option value="P3">P3 (Low)</option>
        </select>

        {/* Type Filter */}
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ flex: '1 1 140px' }}>
          <option value="">All Test Types</option>
          <option value="Positive">Positive</option>
          <option value="Negative">Negative</option>
          <option value="Boundary">Boundary</option>
          <option value="Edge Case">Edge Case</option>
          <option value="Security">Security</option>
          <option value="Validation">Validation</option>
        </select>

        {/* Status Filter */}
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ flex: '1 1 130px' }}>
          <option value="">All Statuses</option>
          <option value="Not Run">Not Run</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      {/* Test Cases Table */}
      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading test suite cases...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Test ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Title</th>
                <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc) => (
                <tr key={tc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{tc.custom_id || `TC-${tc.id}`}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600 }}>{tc.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tc.objective}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={tc.test_type} /></td>
                  <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={tc.priority} /></td>
                  <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={tc.status} /></td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button
                      className="btn-primary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => { setSelectedTcForExec(tc); setIsExecModalOpen(true); }}
                    >
                      <PlayCircle size={14} /> Execute
                    </button>
                  </td>
                </tr>
              ))}
              {testCases.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No test cases matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Test Execution Modal */}
      <TestExecutionModal
        isOpen={isExecModalOpen}
        onClose={() => setIsExecModalOpen(false)}
        testCase={selectedTcForExec}
        onExecuted={fetchTestCases}
      />
    </div>
  );
};

export default TestCasesPage;
