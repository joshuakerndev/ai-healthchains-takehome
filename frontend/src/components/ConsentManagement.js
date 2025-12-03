import React, { useState, useEffect } from 'react';
import './ConsentManagement.css';
import { apiService } from '../services/apiService';
import { useWeb3 } from '../hooks/useWeb3';

const ConsentManagement = ({ account }) => {
  const { signMessage } = useWeb3();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    purpose: '',
  });
  const [verificationMessage, setVerificationMessage] = useState(null);

  const formatDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const fetchConsents = async () => {
    setLoading(true);
    setError(null);

    try {
      const statusParam = filterStatus === 'all' ? null : filterStatus;
      const data = await apiService.getConsents(null, statusParam);

      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.consents)) {
        items = data.consents;
      }

      setConsents(items);
    } catch (err) {
      console.error('Failed to load consents', err);
      setError(err?.message || 'Failed to load consents');
      setConsents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleCreateConsent = async (e) => {
    e.preventDefault();
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    const { patientId, purpose } = formData;

    try {
      setVerificationMessage(null);

      const message = `I consent to: ${purpose} for patient: ${patientId}`;

      // Sign with MetaMask
      const signature = await signMessage(message);

      // Verify signature on backend
      try {
        const verification = await apiService.verifySignature(
          message,
          signature,
          account
        );

        if (verification && verification.isValid === false) {
          setVerificationMessage('Signature verification failed on backend.');
          alert('Signature verification failed. Consent was not created.');
          return;
        }

        setVerificationMessage('Signature verified with backend.');
      } catch (verifyErr) {
        console.warn('Signature verification request failed:', verifyErr);
      }

      await apiService.createConsent({
        patientId,
        purpose,
        walletAddress: account,
        signature,
      });

      await fetchConsents();
      setFormData({ patientId: '', purpose: '' });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create consent', err);
      alert('Failed to create consent: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleUpdateStatus = async (consentId, newStatus) => {
    try {
      const fakeHash = `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`;

      await apiService.updateConsent(consentId, {
        status: newStatus,
        blockchainTxHash: fakeHash,
      });

      await fetchConsents();
    } catch (err) {
      console.error('Failed to update consent', err);
      alert('Failed to update consent: ' + (err?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="consent-management-container">
        <div className="loading">Loading consents...</div>
      </div>
    );
  }

  return (
    <div className="consent-management-container">
      <div className="consent-header">
        <h2>Consent Management</h2>
        <button
          className="create-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!account}
        >
          {showCreateForm ? 'Cancel' : 'Create New Consent'}
        </button>
      </div>

      {!account && (
        <div className="warning">
          Please connect your MetaMask wallet to manage consents
        </div>
      )}

      {error && (
        <div className="warning">
          Error loading consents: {error}
        </div>
      )}

      {verificationMessage && (
        <div className="warning">
          {verificationMessage}
        </div>
      )}

      {showCreateForm && account && (
        <div className="create-consent-form">
          <h3>Create New Consent</h3>
          <form onSubmit={handleCreateConsent}>
            <div className="form-group">
              <label>Patient ID</label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) =>
                  setFormData({ ...formData, patientId: e.target.value })
                }
                required
                placeholder="e.g., patient-001"
              />
            </div>
            <div className="form-group">
              <label>Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                required
              >
                <option value="">Select purpose...</option>
                <option value="Research Study Participation">
                  Research Study Participation
                </option>
                <option value="Data Sharing with Research Institution">
                  Data Sharing with Research Institution
                </option>
                <option value="Third-Party Analytics Access">
                  Third-Party Analytics Access
                </option>
                <option value="Insurance Provider Access">
                  Insurance Provider Access
                </option>
              </select>
            </div>
            <button type="submit" className="submit-btn">
              Sign & Create Consent
            </button>
          </form>
        </div>
      )}

      <div className="consent-filters">
        <button
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
        <button
          className={filterStatus === 'active' ? 'active' : ''}
          onClick={() => setFilterStatus('active')}
        >
          Active
        </button>
        <button
          className={filterStatus === 'pending' ? 'active' : ''}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
      </div>

      <div className="consents-list">
        {consents.length === 0 ? (
          <div className="placeholder">
            <p>No consents found for the selected filter.</p>
          </div>
        ) : (
          consents.map((consent) => (
            <div key={consent.id} className="consent-card">
              <div className="consent-header-info">
                <div className="consent-purpose">{consent.purpose}</div>
                <span className={`consent-status ${consent.status}`}>
                  {consent.status}
                </span>
              </div>

              <div className="consent-details">
                <div className="consent-detail-item">
                  <strong>Patient ID:</strong>
                  <span>{consent.patientId}</span>
                </div>

                <div className="consent-detail-item">
                  <strong>Wallet:</strong>
                  <span className="consent-wallet">
                    {consent.walletAddress}
                  </span>
                </div>

                <div className="consent-detail-item">
                  <strong>Created At:</strong>
                  <span>{formatDate(consent.createdAt)}</span>
                </div>

                {consent.blockchainTxHash && (
                  <div className="consent-detail-item">
                    <strong>Blockchain Tx Hash:</strong>
                    <span className="consent-tx-hash">
                      {consent.blockchainTxHash}
                    </span>
                  </div>
                )}
              </div>

              {consent.status === 'pending' && (
                <div className="consent-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => handleUpdateStatus(consent.id, 'active')}
                  >
                    Mark as Active
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsentManagement;
