import React, { useState } from 'react';
import { X, PlayCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const TestExecutionModal = ({ isOpen, onClose, testCase, onExecuted }) => {
  const [statusVal, setStatusVal] = useState('Passed');
  const [actualResult, setActualResult] = useState('');
  const [notes, setNotes] = useState('');
  const [createBug, setCreateBug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !testCase) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actualResult.trim()) {
      setError('Actual result description is required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post(`/test-cases/${testCase.id}/execute`, {
        actual_result: actualResult,
        status: statusVal,
        notes: notes,
        create_bug_if_failed: createBug,
      });
      onExecuted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record execution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <PlayCircle size={24} style={{ color: 'var(--accent-blue)' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Execute Test Case</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{testCase.custom_id || `TC-${testCase.id}`}: {testCase.title}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
            <X size={22} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Expected Result</label>
            <div className="card" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {testCase.expected_result}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Execution Status</label>
            <select value={statusVal} onChange={(e) => setStatusVal(e.target.value)} style={{ padding: '0.75rem' }}>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Actual Result *</label>
            <textarea
              rows={3}
              value={actualResult}
              onChange={(e) => setActualResult(e.target.value)}
              placeholder="Describe actual behavior observed during execution..."
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Notes / Logs (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Stack trace or execution environment notes..."
            />
          </div>

          {statusVal === 'Failed' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="createBug"
                checked={createBug}
                onChange={(e) => setCreateBug(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <label htmlFor="createBug" style={{ fontSize: '0.875rem', color: 'var(--accent-rose)', cursor: 'pointer' }}>
                Auto-create draft Bug Report on failure
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Save Execution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestExecutionModal;
