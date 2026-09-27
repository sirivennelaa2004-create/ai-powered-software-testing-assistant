import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { testCasesService } from '../services/testCases';
import { executionsService } from '../services/executions';
import { PlayCircle, ArrowLeft, AlertCircle } from 'lucide-react';

const TestExecutionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [testCase, setTestCase] = useState(null);
  const [statusVal, setStatusVal] = useState('Passed');
  const [actualResult, setActualResult] = useState('');
  const [notes, setNotes] = useState('');
  const [createBug, setCreateBug] = useState(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTc = async () => {
      try {
        const res = await testCasesService.getTestCaseById(id);
        setTestCase(res.data);
      } catch (err) {
        setError('Failed to fetch test case details');
      } finally {
        setLoading(false);
      }
    };
    fetchTc();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actualResult.trim()) {
      setError('Actual result is required.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await executionsService.executeTestCase(id, {
        actual_result: actualResult,
        status: statusVal,
        notes: notes,
        create_bug_if_failed: createBug,
      });
      navigate(`/test-cases/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit execution');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading execution form...</div>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <Link to={`/test-cases/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to Test Case
      </Link>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <PlayCircle size={28} style={{ color: 'var(--accent-blue)' }} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Execute Test Case</h1>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{testCase?.custom_id || `TC-${id}`}: {testCase?.title}</span>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>EXPECTED OUTCOME</label>
            <p style={{ fontWeight: 600 }}>{testCase?.expected_result}</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', fontWeight: 600 }}>Execution Status *</label>
            <select value={statusVal} onChange={(e) => setStatusVal(e.target.value)} style={{ padding: '0.75rem' }}>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', fontWeight: 600 }}>Actual Observed Result *</label>
            <textarea
              rows={4}
              value={actualResult}
              onChange={(e) => setActualResult(e.target.value)}
              placeholder="Describe actual behavior observed during manual or automated test run..."
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.4rem', fontWeight: 600 }}>Execution Notes / Log Output</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Stack trace or build version..."
            />
          </div>

          {statusVal === 'Failed' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="autoBug"
                checked={createBug}
                onChange={(e) => setCreateBug(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <label htmlFor="autoBug" style={{ fontSize: '0.875rem', color: 'var(--accent-rose)', cursor: 'pointer' }}>
                Automatically log draft defect report in Bug Tracker
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Link to={`/test-cases/${id}`} className="btn-secondary">Cancel</Link>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting Run...' : 'Record Test Execution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestExecutionPage;
