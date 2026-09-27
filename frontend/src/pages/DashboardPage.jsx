import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { FolderKanban, FileText, CheckSquare, Bug, Activity, CheckCircle2, XCircle } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading testing workspace metrics...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Testing Quality Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of requirements, test executions, pass rates, and bug diagnostics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid-stats">
        <div className="card stat-card">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Projects</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats?.total_projects || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
            <FolderKanban size={24} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Requirements</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats?.total_requirements || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
            <FileText size={24} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Test Cases</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats?.total_test_cases || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <CheckSquare size={24} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Open Bugs</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats?.total_bugs || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)' }}>
            <Bug size={24} />
          </div>
        </div>
      </div>

      {/* Pass Rate & Distribution Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Overall Test Pass Rate</h4>
          <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', background: 'conic-gradient(var(--accent-emerald) calc(var(--rate, 0) * 1%), rgba(255,255,255,0.1) 0)', display: 'flex', alignItems: 'center', justifyContent: 'center', '--rate': stats?.pass_rate_percentage || 0 }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{stats?.pass_rate_percentage || 0}%</span>
            </div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Total Executions: {stats?.total_executions || 0}
          </p>
        </div>

        {/* Test Case Status Distribution */}
        <div className="card">
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Test Case Status Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(stats?.test_case_status_distribution || {}).map(([st, count]) => (
              <div key={st} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge status={st} />
                <span style={{ fontWeight: 700 }}>{count} cases</span>
              </div>
            ))}
            {Object.keys(stats?.test_case_status_distribution || {}).length === 0 && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No test cases executed yet.</span>
            )}
          </div>
        </div>

        {/* Bug Severity Distribution */}
        <div className="card">
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Bugs by Severity</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(stats?.bug_severity_distribution || {}).map(([sev, count]) => (
              <div key={sev} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge status={sev} />
                <span style={{ fontWeight: 700 }}>{count} bugs</span>
              </div>
            ))}
            {Object.keys(stats?.bug_severity_distribution || {}).length === 0 && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No bug reports logged.</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="card">
        <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} style={{ color: 'var(--accent-blue)' }} /> Recent Activity Log
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats?.recent_activity?.map((act, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {act.status === 'Passed' ? <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} /> : <XCircle size={18} style={{ color: 'var(--accent-rose)' }} />}
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{act.title}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(act.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <StatusBadge status={act.status} />
            </div>
          ))}
          {(!stats?.recent_activity || stats.recent_activity.length === 0) && (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No recent activity.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
