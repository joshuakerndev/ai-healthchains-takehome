import React, { useState, useEffect } from 'react';
import './StatsDashboard.css';
import { apiService } from '../services/apiService';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getStats();
        setStats(data || {});
      } catch (err) {
        console.error('Failed to load statistics', err);
        setError(err?.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-dashboard-container">
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-dashboard-container">
        <div className="error">
          Error loading statistics: {error || 'No data available'}
        </div>
      </div>
    );
  }

  const {
    totalPatients = 0,
    totalRecords = 0,
    totalConsents = 0,
    activeConsents = 0,
    pendingConsents = 0,
    totalTransactions = 0,
  } = stats;

  return (
    <div className="stats-dashboard-container">
      <h2>Platform Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-label">Total Patients</div>
          <div className="stat-value">{totalPatients}</div>
          <div className="stat-description">
            Unique patients currently stored in the system.
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Records</div>
          <div className="stat-value">{totalRecords}</div>
          <div className="stat-description">
            Medical records linked to patients on-chain and off-chain.
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Consents</div>
          <div className="stat-value">{totalConsents}</div>
          <div className="stat-description">
            All consent agreements recorded in the platform.
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Consents</div>
          <div className="stat-value">{activeConsents}</div>
          <div className="stat-description">
            Currently active data sharing permissions.
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Consents</div>
          <div className="stat-value">{pendingConsents}</div>
          <div className="stat-description">
            Consents awaiting confirmation or activation.
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{totalTransactions}</div>
          <div className="stat-description">
            Blockchain transactions recorded for this environment.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
