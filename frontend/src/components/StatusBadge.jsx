import React from 'react';

const StatusBadge = ({ status, type = 'status' }) => {
  if (!status) return null;

  const normalized = status.toString().toLowerCase().replace(/\s+/g, '');

  let badgeClass = 'badge-notrun';
  if (['passed', 'approved', 'resolved', 'closed'].includes(normalized)) {
    badgeClass = 'badge-passed';
  } else if (['failed', 'critical', 'p0', 'high'].includes(normalized)) {
    badgeClass = 'badge-failed';
  } else if (['blocked', 'p1', 'medium'].includes(normalized)) {
    badgeClass = 'badge-blocked';
  } else if (['p2', 'p3', 'low', 'draft'].includes(normalized)) {
    badgeClass = 'badge-notrun';
  }

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};

export default StatusBadge;
