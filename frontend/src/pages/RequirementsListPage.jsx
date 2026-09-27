import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requirementsService } from '../services/requirements';
import { projectsService } from '../services/projects';
import StatusBadge from '../components/StatusBadge';
import { FileText, Plus, Sparkles, Filter, ArrowRight } from 'lucide-react';

const RequirementsListPage = () => {
  const [requirements, setRequirements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequirements = async () => {
    try {
      const params = {};
      if (selectedProject) params.project_id = selectedProject;
      if (selectedPriority) params.priority = selectedPriority;
      if (selectedStatus) params.status = selectedStatus;

      const res = await requirementsService.getRequirements(params);
      setRequirements(res.data);
    } catch (err) {
      console.error('Failed to fetch requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectsService.getProjects();
        setProjects(res.data);
        if (res.data.length > 0) setProjectId(res.data[0].id);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchRequirements();
  }, [selectedProject, selectedPriority, selectedStatus]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!projectId) {
      alert('Please select a project');
      return;
    }
    setSubmitting(true);
    try {
      await requirementsService.createRequirement({
        title,
        description,
        project_id: parseInt(projectId),
        priority,
      });
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      fetchRequirements();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add requirement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Software Requirements</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Functional specs ready for AI test generation</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Requirement
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{ flex: 1 }}>
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} style={{ flex: 1 }}>
          <option value="">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ flex: 1 }}>
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Approved">Approved</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading requirements...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requirements.map((req) => (
            <div key={req.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{req.title}</h3>
                  <StatusBadge status={req.priority} />
                  <StatusBadge status={req.status} />
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{req.description}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/requirements/${req.id}`} className="btn-ai" style={{ whiteSpace: 'nowrap' }}>
                  <Sparkles size={16} /> Workbench
                </Link>
              </div>
            </div>
          ))}

          {requirements.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No requirements found. Click <strong>New Requirement</strong> to get started.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Add New Requirement</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', fontWeight: 600 }}>Project *</label>
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', fontWeight: 600 }}>Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Requirement summary title..." required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', fontWeight: 600 }}>Description *</label>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full technical requirement specification..." required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', fontWeight: 600 }}>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementsListPage;
