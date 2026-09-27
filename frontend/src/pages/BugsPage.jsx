import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import AIModal from '../components/AIModal';
import { Bug, Sparkles, Plus, AlertCircle } from 'lucide-react';

const BugsPage = () => {
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Bug Modal State
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [projectId, setProjectId] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [priority, setPriority] = useState('P2');
  const [submitting, setSubmitting] = useState(false);

  // AI Bug Analysis State
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const fetchBugs = async () => {
    try {
      const response = await api.get('/bugs');
      setBugs(response.data);
    } catch (err) {
      console.error('Failed to fetch bugs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
        if (res.data.length > 0) setProjectId(res.data[0].id);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    fetchProjects();
    fetchBugs();
  }, []);

  const handleCreateBug = async (e) => {
    e.preventDefault();
    if (!projectId) {
      alert('Please select a project first');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/bugs', {
        title,
        description,
        steps_to_reproduce: stepsToReproduce,
        expected_result: expectedResult,
        actual_result: actualResult,
        project_id: parseInt(projectId),
        severity,
        priority,
      });
      setTitle('');
      setDescription('');
      setStepsToReproduce('');
      setExpectedResult('');
      setActualResult('');
      setIsBugModalOpen(false);
      fetchBugs();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to log bug report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnalyzeBugAI = async (bugId) => {
    setAiLoading(true);
    try {
      const res = await api.post(`/bugs/${bugId}/analyze-ai?auto_update_severity_priority=true`);
      setSelectedAnalysis(res.data);
      setIsAiModalOpen(true);
      fetchBugs();
    } catch (err) {
      alert(err.response?.data?.detail || 'AI Bug Analysis failed.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Bug Reports & AI Diagnostics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log defect reports and analyze root causes with AI</p>
        </div>
        <button className="btn-primary" onClick={() => setIsBugModalOpen(true)}>
          <Plus size={18} /> Log New Bug
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading bug reports...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bugs.map((bug) => (
            <div key={bug.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <StatusBadge status={bug.severity} />
                  <StatusBadge status={bug.priority} />
                  <StatusBadge status={bug.status} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logged {new Date(bug.created_at).toLocaleDateString()}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>{bug.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{bug.description}</p>
                {bug.actual_result && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-rose)', background: 'rgba(239, 68, 68, 0.08)', padding: '0.5rem', borderRadius: '4px' }}>
                    <strong>Observed Behavior:</strong> {bug.actual_result}
                  </div>
                )}
              </div>

              <button
                className="btn-ai"
                onClick={() => handleAnalyzeBugAI(bug.id)}
                disabled={aiLoading}
                style={{ whiteSpace: 'nowrap', marginTop: '0.5rem' }}
              >
                <Sparkles size={16} /> {aiLoading ? 'Analyzing...' : 'AI Diagnostics'}
              </button>
            </div>
          ))}

          {bugs.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No bug reports logged. Click <strong>Log New Bug</strong> to file a defect report.
            </div>
          )}
        </div>
      )}

      {/* Log Bug Modal */}
      {isBugModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsBugModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Log New Bug Report</h2>
            <form onSubmit={handleCreateBug} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.3rem', fontWeight: 600 }}>Project *</label>
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.3rem', fontWeight: 600 }}>Bug Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. JWT Auth Token expires immediately on page refresh"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.3rem', fontWeight: 600 }}>Description *</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="High-level description of failure..."
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.3rem', fontWeight: 600 }}>Steps to Reproduce</label>
                <textarea
                  rows={2}
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. Navigate to...\n2. Click..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.3rem', fontWeight: 600 }}>Expected Result</label>
                  <input type="text" value={expectedResult} onChange={(e) => setExpectedResult(e.target.value)} placeholder="User remains logged in" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.3rem', fontWeight: 600 }}>Actual Result</label>
                  <input type="text" value={actualResult} onChange={(e) => setActualResult(e.target.value)} placeholder="401 Unauthorized" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.3rem', fontWeight: 600 }}>Severity</label>
                  <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.3rem', fontWeight: 600 }}>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsBugModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Log Bug Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Bug Analysis Modal */}
      <AIModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="AI Bug Diagnostics & Root Cause Report"
        data={selectedAnalysis}
        type="bug"
      />
    </div>
  );
};

export default BugsPage;
