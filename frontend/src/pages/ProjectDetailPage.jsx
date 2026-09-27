import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { FileText, CheckSquare, Bug, Plus, ArrowRight } from 'lucide-react';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [activeTab, setActiveTab] = useState('requirements');
  const [loading, setLoading] = useState(true);

  // New Requirement Form state
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqPriority, setReqPriority] = useState('Medium');

  const fetchProjectDetails = async () => {
    try {
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);

      const [reqRes, tcRes, bugRes] = await Promise.all([
        api.get(`/requirements?project_id=${id}`),
        api.get(`/test-cases?project_id=${id}`),
        api.get(`/bugs?project_id=${id}`),
      ]);

      setRequirements(reqRes.data);
      setTestCases(tcRes.data);
      setBugs(bugRes.data);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requirements', {
        title: reqTitle,
        description: reqDesc,
        project_id: parseInt(id),
        priority: reqPriority,
      });
      setReqTitle('');
      setReqDesc('');
      setIsReqModalOpen(false);
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add requirement');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading project suite...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 600 }}>PROJECT WORKSPACE</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{project?.name}</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{project?.description || 'No description'}</p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button
          className={`btn-secondary ${activeTab === 'requirements' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('requirements')}
          style={{ borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FileText size={18} /> Requirements ({requirements.length})
        </button>
        <button
          className={`btn-secondary ${activeTab === 'test-cases' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('test-cases')}
          style={{ borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <CheckSquare size={18} /> Test Cases ({testCases.length})
        </button>
        <button
          className={`btn-secondary ${activeTab === 'bugs' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('bugs')}
          style={{ borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Bug size={18} /> Bugs ({bugs.length})
        </button>
      </div>

      {/* REQUIREMENTS TAB */}
      {activeTab === 'requirements' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Project Requirements</h3>
            <button className="btn-primary" onClick={() => setIsReqModalOpen(true)}>
              <Plus size={16} /> Add Requirement
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requirements.map((req) => (
              <div key={req.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{req.title}</h4>
                    <StatusBadge status={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{req.description}</p>
                </div>
                <Link to={`/requirements/${req.id}`} className="btn-ai" style={{ whiteSpace: 'nowrap' }}>
                  Analyze & Generate <ArrowRight size={16} />
                </Link>
              </div>
            ))}
            {requirements.length === 0 && (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                No requirements added to this project yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEST CASES TAB */}
      {activeTab === 'test-cases' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {testCases.map((tc) => (
            <div key={tc.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>{tc.custom_id || `TC-${tc.id}`}</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{tc.title}</h4>
                  <StatusBadge status={tc.status} />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Type: {tc.test_type} • Expected: {tc.expected_result}</span>
              </div>
            </div>
          ))}
          {testCases.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              No test cases generated or created yet.
            </div>
          )}
        </div>
      )}

      {/* BUGS TAB */}
      {activeTab === 'bugs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bugs.map((b) => (
            <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{b.title}</h4>
                  <StatusBadge status={b.severity} />
                  <StatusBadge status={b.status} />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{b.description}</span>
              </div>
            </div>
          ))}
          {bugs.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              No bugs logged for this project.
            </div>
          )}
        </div>
      )}

      {/* Add Requirement Modal */}
      {isReqModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsReqModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Add New Requirement</h2>
            <form onSubmit={handleCreateRequirement} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', fontWeight: 600 }}>Requirement Title *</label>
                <input
                  type="text"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. Users must be able to reset forgotten password via email"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', fontWeight: 600 }}>Full Description *</label>
                <textarea
                  rows={4}
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  placeholder="Detailed functional rules, expected flow, inputs..."
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', fontWeight: 600 }}>Priority</label>
                <select value={reqPriority} onChange={(e) => setReqPriority(e.target.value)}>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsReqModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Requirement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
