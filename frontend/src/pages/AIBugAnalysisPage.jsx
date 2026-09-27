import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bugsService } from '../services/bugs';
import { aiService } from '../services/ai';
import StatusBadge from '../components/StatusBadge';
import { Sparkles, ArrowLeft, Cpu, CheckCircle, AlertCircle } from 'lucide-react';

const AIBugAnalysisPage = () => {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const bugRes = await bugsService.getBugById(id);
        setBug(bugRes.data);

        const anRes = await aiService.analyzeBug(id);
        setAnalysis(anRes.data);
      } catch (err) {
        console.error('Failed to run AI bug diagnostics:', err);
      } finally {
        setLoading(false);
      }
    };
    runAnalysis();
  }, [id]);

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Running AI Bug Diagnostics...</div>;

  const result = analysis?.structured_result || {};

  return (
    <div>
      <Link to={`/bugs/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to Bug Details
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899', fontSize: '0.9rem', fontWeight: 600 }}>
          <Sparkles size={18} /> AI BUG DIAGNOSTICS REPORT
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{bug?.title}</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {result.possible_root_causes?.length > 0 && (
          <div className="card">
            <h3 style={{ color: 'var(--accent-purple)', marginBottom: '0.75rem' }}>Probable Technical Root Causes</h3>
            <ul style={{ paddingLeft: '1.25rem' }}>
              {result.possible_root_causes.map((rc, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{rc}</li>)}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div className="card" style={{ flex: 1 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Suggested Severity: </span>
            <StatusBadge status={result.suggested_severity} />
          </div>
          <div className="card" style={{ flex: 1 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Suggested Priority: </span>
            <StatusBadge status={result.suggested_priority} />
          </div>
        </div>

        {result.recommended_next_testing_steps?.length > 0 && (
          <div className="card" style={{ borderTop: '4px solid var(--accent-emerald)' }}>
            <h3 style={{ color: 'var(--accent-emerald)', marginBottom: '0.75rem' }}>Recommended Next Testing Steps</h3>
            <ol style={{ paddingLeft: '1.25rem' }}>
              {result.recommended_next_testing_steps.map((st, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{st}</li>)}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIBugAnalysisPage;
