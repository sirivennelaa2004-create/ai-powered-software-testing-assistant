import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bugsService } from '../services/bugs';
import { aiService } from '../services/ai';
import StatusBadge from '../components/StatusBadge';
import AIModal from '../components/AIModal';
import { Bug, Sparkles, ArrowLeft, Cpu } from 'lucide-react';

const BugDetailPage = () => {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [aiLoading, setAiLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const fetchBugDetails = async () => {
    try {
      const [bRes, anRes] = await Promise.all([
        bugsService.getBugById(id),
        bugsService.getAnalyses(id),
      ]);
      setBug(bRes.data);
      setAnalyses(anRes.data);
    } catch (err) {
      console.error('Failed to load bug details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugDetails();
  }, [id]);

  const handleAnalyzeBugAI = async () => {
    setAiLoading(true);
    try {
      const res = await aiService.analyzeBug(id);
      setSelectedAnalysis(res.data);
      setIsAiModalOpen(true);
      fetchBugDetails();
    } catch (err) {
      alert(err.response?.data?.detail || 'AI Bug Analysis failed.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading bug report details...</div>;
  if (!bug) return <div style={{ color: 'var(--text-secondary)' }}>Bug report not found.</div>;

  return (
    <div>
      <Link to="/bugs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to Bug Reports
      </Link>

      <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <StatusBadge status={bug.severity} />
              <StatusBadge status={bug.priority} />
              <StatusBadge status={bug.status} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logged {new Date(bug.created_at).toLocaleString()}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{bug.title}</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{bug.description}</p>
          </div>

          <button className="btn-ai" onClick={handleAnalyzeBugAI} disabled={aiLoading}>
            <Sparkles size={16} /> {aiLoading ? 'Diagnosing...' : 'Analyze with AI'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>EXPECTED RESULT</h4>
            <p style={{ color: 'var(--text-primary)' }}>{bug.expected_result || 'N/A'}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-rose)', marginBottom: '0.25rem' }}>ACTUAL OBSERVED RESULT</h4>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{bug.actual_result || 'N/A'}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ENVIRONMENT</h4>
            <p style={{ color: 'var(--text-primary)' }}>{bug.environment || 'Staging'}</p>
          </div>
        </div>

        {bug.steps_to_reproduce && (
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>STEPS TO REPRODUCE</h4>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '6px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem' }}>
              {bug.steps_to_reproduce}
            </div>
          </div>
        )}
      </div>

      {/* AI Diagnostic Reports History */}
      {analyses.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} style={{ color: '#ec4899' }} /> AI Diagnostic Reports ({analyses.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analyses.map((an) => (
              <div key={an.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>AI Root Cause Assessment #{an.id}</span>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Provider: {an.provider} • Tokens: {an.tokens_used}
                  </span>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => { setSelectedAnalysis(an); setIsAiModalOpen(true); }}
                >
                  View Full Report
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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

export default BugDetailPage;
