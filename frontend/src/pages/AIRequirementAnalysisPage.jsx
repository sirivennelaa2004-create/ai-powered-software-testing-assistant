import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requirementsService } from '../services/requirements';
import { aiService } from '../services/ai';
import StatusBadge from '../components/StatusBadge';
import { Sparkles, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

const AIRequirementAnalysisPage = () => {
  const { id } = useParams();
  const [requirement, setRequirement] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const reqRes = await requirementsService.getRequirementById(id);
        setRequirement(reqRes.data);

        const anRes = await aiService.analyzeRequirement(id);
        setAnalysis(anRes.data);
      } catch (err) {
        console.error('Failed to run AI requirement analysis:', err);
      } finally {
        setLoading(false);
      }
    };
    runAnalysis();
  }, [id]);

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Running AI Requirement Analysis...</div>;

  const result = analysis?.structured_result || {};

  return (
    <div>
      <Link to={`/requirements/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to Requirement Workbench
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899', fontSize: '0.9rem', fontWeight: 600 }}>
          <Sparkles size={18} /> AI ANALYSIS REPORT
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{requirement?.title}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {result.functional_requirements?.length > 0 && (
          <div className="card" style={{ borderTop: '4px solid var(--accent-blue)' }}>
            <h3 style={{ color: 'var(--accent-blue)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} /> Functional Requirements
            </h3>
            <ul style={{ paddingLeft: '1.25rem' }}>
              {result.functional_requirements.map((item, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{item}</li>)}
            </ul>
          </div>
        )}

        {result.possible_assumptions?.length > 0 && (
          <div className="card" style={{ borderTop: '4px solid var(--accent-cyan)' }}>
            <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>Implicit Assumptions</h3>
            <ul style={{ paddingLeft: '1.25rem' }}>
              {result.possible_assumptions.map((item, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{item}</li>)}
            </ul>
          </div>
        )}

        {result.missing_information?.length > 0 && (
          <div className="card" style={{ borderTop: '4px solid var(--accent-amber)' }}>
            <h3 style={{ color: 'var(--accent-amber)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> Ambiguous Specs
            </h3>
            <ul style={{ paddingLeft: '1.25rem' }}>
              {result.missing_information.map((item, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{item}</li>)}
            </ul>
          </div>
        )}

        {result.risks?.length > 0 && (
          <div className="card" style={{ borderTop: '4px solid var(--accent-rose)' }}>
            <h3 style={{ color: 'var(--accent-rose)', marginBottom: '0.75rem' }}>Identified Risks</h3>
            <ul style={{ paddingLeft: '1.25rem' }}>
              {result.risks.map((item, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRequirementAnalysisPage;
