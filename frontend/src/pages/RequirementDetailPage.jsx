import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import AIModal from '../components/AIModal';
import { Sparkles, Cpu, CheckSquare, Layers, Eye } from 'lucide-react';

const RequirementDetailPage = () => {
  const { id } = useParams();
  const [requirement, setRequirement] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [aiLoading, setAiLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const fetchRequirementData = async () => {
    try {
      const [reqRes, scRes, tcRes, anRes] = await Promise.all([
        api.get(`/requirements/${id}`),
        api.get(`/requirements/${id}/scenarios`),
        api.get(`/test-cases?requirement_id=${id}`),
        api.get(`/requirements/${id}/analyses`),
      ]);

      setRequirement(reqRes.data);
      setScenarios(scRes.data);
      setTestCases(tcRes.data);
      setAnalyses(anRes.data);
    } catch (err) {
      console.error('Failed to load requirement details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirementData();
  }, [id]);

  // AI Requirement Analysis Action (Phase 7)
  const handleAnalyzeRequirementAI = async () => {
    setAiLoading(true);
    try {
      const res = await api.post(`/requirements/${id}/analyze`);
      setSelectedAnalysis(res.data);
      setIsAnalysisModalOpen(true);
      fetchRequirementData();
    } catch (err) {
      alert(err.response?.data?.detail || 'AI Requirement Analysis failed.');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Scenario Generation Action (Phase 8)
  const handleGenerateScenariosAI = async () => {
    setAiLoading(true);
    try {
      await api.post(`/requirements/${id}/generate-scenarios`);
      fetchRequirementData();
    } catch (err) {
      alert(err.response?.data?.detail || 'AI Scenario Generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Test Case Generation Action (Phase 9)
  const handleGenerateTestCasesAI = async () => {
    setAiLoading(true);
    try {
      await api.post(`/requirements/${id}/generate-test-cases`);
      fetchRequirementData();
    } catch (err) {
      alert(err.response?.data?.detail || 'AI Test Case Generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading requirement analysis workbench...</div>;

  return (
    <div>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <StatusBadge status={requirement?.priority} />
              <StatusBadge status={requirement?.status} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{requirement?.title}</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{requirement?.description}</p>
          </div>

          {/* AI Generation Control Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '220px' }}>
            <button className="btn-ai" onClick={handleAnalyzeRequirementAI} disabled={aiLoading}>
              <Sparkles size={16} /> {aiLoading ? 'Processing AI...' : '1. Analyze Requirement'}
            </button>
            <button className="btn-ai" onClick={handleGenerateScenariosAI} disabled={aiLoading}>
              <Layers size={16} /> {aiLoading ? 'Processing AI...' : '2. Generate Scenarios'}
            </button>
            <button className="btn-ai" onClick={handleGenerateTestCasesAI} disabled={aiLoading}>
              <CheckSquare size={16} /> {aiLoading ? 'Processing AI...' : '3. Generate Test Cases'}
            </button>
          </div>
        </div>
      </div>

      {/* Saved AI Analyses Section */}
      {analyses.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} style={{ color: '#ec4899' }} /> Saved AI Analysis Reports ({analyses.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {analyses.map((an) => (
              <div key={an.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Analysis #{an.id}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Provider: {an.provider} • {new Date(an.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => { setSelectedAnalysis(an); setIsAnalysisModalOpen(true); }}
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Eye size={14} /> View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Test Scenarios Grid (Phase 8) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} style={{ color: 'var(--accent-blue)' }} /> Test Scenarios ({scenarios.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {scenarios.map((sc) => (
            <div key={sc.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{sc.title}</h4>
                <StatusBadge status={sc.scenario_type} />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{sc.description || 'No additional scenario notes.'}</p>
            </div>
          ))}
          {scenarios.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No test scenarios generated yet. Click <strong>Generate Scenarios</strong> above.
            </div>
          )}
        </div>
      </div>

      {/* Generated Test Cases Table (Phase 9) */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckSquare size={20} style={{ color: 'var(--accent-emerald)' }} /> Generated Test Cases ({testCases.length})
        </h3>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Title & Objective</th>
                <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                <th style={{ padding: '0.85rem 1rem' }}>Expected Result</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
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
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>{tc.expected_result}</td>
                  <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={tc.status} /></td>
                </tr>
              ))}
              {testCases.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No test cases generated for this requirement yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Analysis Modal */}
      <AIModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        title="AI Requirement Analysis Report"
        data={selectedAnalysis}
        type="analysis"
      />
    </div>
  );
};

export default RequirementDetailPage;
