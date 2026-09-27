import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requirementsService } from '../services/requirements';
import { scenariosService } from '../services/scenarios';
import StatusBadge from '../components/StatusBadge';
import { Layers, Sparkles, ArrowLeft, CheckSquare } from 'lucide-react';

const TestScenariosPage = () => {
  const { id } = useParams();
  const [requirement, setRequirement] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchScenarios = async () => {
    try {
      const [reqRes, scRes] = await Promise.all([
        requirementsService.getRequirementById(id),
        requirementsService.getScenarios(id),
      ]);
      setRequirement(reqRes.data);
      setScenarios(scRes.data);
    } catch (err) {
      console.error('Failed to load scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [id]);

  const handleGenerateScenarios = async () => {
    setAiLoading(true);
    try {
      await scenariosService.generateScenariosAI(id);
      fetchScenarios();
    } catch (err) {
      alert('Failed to generate scenarios');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading test scenarios...</div>;

  return (
    <div>
      <Link to={`/requirements/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to Requirement
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Test Scenarios Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Scenarios for {requirement?.title}</p>
        </div>
        <button className="btn-ai" onClick={handleGenerateScenarios} disabled={aiLoading}>
          <Sparkles size={16} /> {aiLoading ? 'Generating...' : 'Generate Scenarios (AI)'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {scenarios.map((sc) => (
          <div key={sc.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{sc.title}</h3>
              <StatusBadge status={sc.scenario_type} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{sc.description || 'No detailed description.'}</p>
          </div>
        ))}

        {scenarios.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No scenarios generated yet. Click <strong>Generate Scenarios (AI)</strong> above.
          </div>
        )}
      </div>
    </div>
  );
};

export default TestScenariosPage;
