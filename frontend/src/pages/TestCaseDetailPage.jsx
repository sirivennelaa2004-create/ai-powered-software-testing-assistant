import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { testCasesService } from '../services/testCases';
import { aiService } from '../services/ai';
import StatusBadge from '../components/StatusBadge';
import TestExecutionModal from '../components/TestExecutionModal';
import { CheckSquare, Sparkles, PlayCircle, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

const TestCaseDetailPage = () => {
  const { id } = useParams();
  const [testCase, setTestCase] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [qualityAnalysis, setQualityAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isExecModalOpen, setIsExecModalOpen] = useState(false);

  const fetchTestCaseDetails = async () => {
    try {
      const [tcRes, execRes] = await Promise.all([
        testCasesService.getTestCaseById(id),
        testCasesService.getExecutions(id),
      ]);
      setTestCase(tcRes.data);
      setExecutions(execRes.data);
    } catch (err) {
      console.error('Failed to load test case:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCaseDetails();
  }, [id]);

  const handleAnalyzeQualityAI = async () => {
    setAiLoading(true);
    try {
      const res = await aiService.analyzeTestCaseQuality(id);
      setQualityAnalysis(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Quality analysis failed.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading test case details...</div>;
  if (!testCase) return <div style={{ color: 'var(--text-secondary)' }}>Test case not found.</div>;

  const stepsList = Array.isArray(testCase.steps)
    ? testCase.steps
    : (testCase.steps || '').split('\n').filter(Boolean);

  return (
    <div>
      <Link to="/test-cases" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to Test Cases
      </Link>

      {/* Main Test Case Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--accent-blue)', fontSize: '1rem' }}>{testCase.custom_id || `TC-${testCase.id}`}</span>
              <StatusBadge status={testCase.test_type} />
              <StatusBadge status={testCase.priority} />
              <StatusBadge status={testCase.status} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{testCase.title}</h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-ai" onClick={handleAnalyzeQualityAI} disabled={aiLoading}>
              <Sparkles size={16} /> {aiLoading ? 'Auditing...' : 'Analyze Quality (AI)'}
            </button>
            <button className="btn-primary" onClick={() => setIsExecModalOpen(true)}>
              <PlayCircle size={16} /> Run Execution
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>OBJECTIVE</h4>
            <p style={{ color: 'var(--text-primary)' }}>{testCase.objective || 'Not specified'}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>PRECONDITIONS</h4>
            <p style={{ color: 'var(--text-primary)' }}>{testCase.preconditions || 'None'}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>TEST DATA</h4>
            <p style={{ color: 'var(--text-primary)' }}>{testCase.test_data || 'None'}</p>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>STEPS TO EXECUTE</h4>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {stepsList.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        <div style={{ marginTop: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', marginBottom: '0.25rem' }}>EXPECTED RESULT</h4>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{testCase.expected_result}</p>
        </div>
      </div>

      {/* AI QUALITY AUDIT REPORT PANEL */}
      {qualityAnalysis && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--accent-purple)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} /> AI Test Case Quality Assessment
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Quality Score:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: qualityAnalysis.quality_score >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {qualityAnalysis.quality_score} / 100
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-amber)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} /> Audit Issues Found
              </h4>
              <ul style={{ paddingLeft: '1.25rem' }}>
                {qualityAnalysis.issues.map((iss, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>{iss}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={16} /> Improvement Suggestions
              </h4>
              <ul style={{ paddingLeft: '1.25rem' }}>
                {qualityAnalysis.suggestions.map((sug, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>{sug}</li>
                ))}
              </ul>
            </div>
          </div>

          {qualityAnalysis.improved_test_case && (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Refined AI Test Case Version</h4>
              <p><strong>Title:</strong> {qualityAnalysis.improved_test_case.title}</p>
              <p><strong>Objective:</strong> {qualityAnalysis.improved_test_case.objective}</p>
              <p><strong>Expected Result:</strong> {qualityAnalysis.improved_test_case.expected_result}</p>
            </div>
          )}
        </div>
      )}

      {/* Execution History */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Execution Run History ({executions.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {executions.map((ex) => (
            <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div>
                <StatusBadge status={ex.status} />
                <span style={{ marginLeft: '1rem', fontSize: '0.9rem' }}>{ex.actual_result}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(ex.execution_time).toLocaleString()}</span>
            </div>
          ))}
          {executions.length === 0 && (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No execution runs recorded for this test case yet.</span>
          )}
        </div>
      </div>

      <TestExecutionModal
        isOpen={isExecModalOpen}
        onClose={() => setIsExecModalOpen(false)}
        testCase={testCase}
        onExecuted={fetchTestCaseDetails}
      />
    </div>
  );
};

export default TestCaseDetailPage;
