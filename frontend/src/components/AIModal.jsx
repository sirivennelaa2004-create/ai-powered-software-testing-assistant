import React from 'react';
import { X, Sparkles, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';
import StatusBadge from './StatusBadge';

const AIModal = ({ isOpen, onClose, title, data, type = 'analysis' }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '0.5rem', borderRadius: '8px', color: '#ec4899' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={14} /> Provider: {data.provider || 'AI Provider Layer'} • Tokens: {data.tokens_used || 0}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
            <X size={22} />
          </button>
        </div>

        {type === 'analysis' && data.structured_result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {data.structured_result.functional_requirements?.length > 0 && (
              <div className="card" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} /> Functional Requirements
                </h4>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-primary)' }}>
                  {data.structured_result.functional_requirements.map((item, i) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.structured_result.possible_assumptions?.length > 0 && (
              <div className="card">
                <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Implicit Assumptions</h4>
                <ul style={{ paddingLeft: '1.25rem' }}>
                  {data.structured_result.possible_assumptions.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.structured_result.missing_information?.length > 0 && (
              <div className="card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <h4 style={{ color: 'var(--accent-amber)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} /> Ambiguous / Missing Specs
                </h4>
                <ul style={{ paddingLeft: '1.25rem' }}>
                  {data.structured_result.missing_information.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.structured_result.risks?.length > 0 && (
              <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h4 style={{ color: 'var(--accent-rose)', marginBottom: '0.5rem' }}>Identified Risks</h4>
                <ul style={{ paddingLeft: '1.25rem' }}>
                  {data.structured_result.risks.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {type === 'bug' && data.structured_result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card">
              <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>Root Cause Analysis</h4>
              <p style={{ color: 'var(--text-primary)' }}>{data.structured_result.root_cause_analysis}</p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI Suggested Severity: </span>
                <StatusBadge status={data.structured_result.suggested_severity} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI Suggested Priority: </span>
                <StatusBadge status={data.structured_result.suggested_priority} />
              </div>
            </div>

            {data.structured_result.recommended_fix_steps?.length > 0 && (
              <div className="card" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <h4 style={{ color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>Recommended Fix Steps</h4>
                <ol style={{ paddingLeft: '1.25rem' }}>
                  {data.structured_result.recommended_fix_steps.map((step, i) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;
