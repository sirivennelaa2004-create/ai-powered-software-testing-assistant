import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Cpu, Key } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Profile & Application Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your user account & AI provider configuration</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--gradient-brand)', padding: '1rem', borderRadius: '50%', color: 'white' }}>
            <User size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.full_name}</h2>
            <span style={{ color: 'var(--accent-blue)', fontSize: '0.875rem', fontWeight: 600 }}>{user?.role || 'Tester'}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</span>
            <p style={{ fontWeight: 600 }}>{user?.email}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Account Status</span>
            <p style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Active</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={20} style={{ color: '#ec4899' }} /> Configured AI Engine Settings
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          The AI provider abstraction is dynamically configured via backend environment variables (`.env`).
        </p>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace' }}>
          <div>AI_PROVIDER = mock / openai / gemini / ollama</div>
          <div>AI_MODEL_NAME = gpt-4o-mini / gemini-1.5-flash</div>
          <div>SAFE_PARSER_VALIDATION = Enabled (Pydantic v2)</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
