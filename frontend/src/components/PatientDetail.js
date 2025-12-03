import React, { useState, useEffect } from 'react';
import './PatientDetail.css';
import { apiService } from '../services/apiService';

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const getRecordTypeClass = (type) => {
  if (!type) return 'record-type';
  const t = type.toLowerCase();

  if (t.includes('diagnostic')) return 'record-type diagnostic';
  if (t.includes('treatment')) return 'record-type treatment';
  if (t.includes('lab')) return 'record-type lab';

  // fallback
  return 'record-type';
};

const getStatusClass = (status) => {
  if (!status) return 'record-status';
  const s = status.toLowerCase();

  if (s.includes('verified') || s.includes('completed')) {
    return 'record-status verified';
  }
  if (s.includes('pending')) {
    return 'record-status pending';
  }

  return 'record-status';
};

const PatientDetail = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [patientData, recordsData] = await Promise.all([
          apiService.getPatient(patientId),
          apiService.getPatientRecords(patientId),
        ]);

        setPatient(patientData);

        let normalizedRecords = [];
        if (Array.isArray(recordsData)) {
          normalizedRecords = recordsData;
        } else if (recordsData && Array.isArray(recordsData.records)) {
          normalizedRecords = recordsData.records;
        }
        setRecords(normalizedRecords);
      } catch (err) {
        console.error('Failed to load patient details', err);
        setError(err.message || 'Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="patient-detail-container">
        <div className="loading">Loading patient details...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="patient-detail-container">
        <div className="error">
          Error loading patient: {error || 'Patient not found'}
        </div>
        <button onClick={onBack} className="back-btn">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="patient-detail-container">
      <div className="patient-detail-header">
        <button onClick={onBack} className="back-btn">
          ← Back to List
        </button>
      </div>

      <div className="patient-detail-content">
        {/* Patient info */}
        <div className="patient-info-section">
          <h2>Patient Information</h2>

          <div className="patient-info-grid">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">{patient.name}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Patient ID</span>
              <span className="info-value">{patient.patientId}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{patient.email}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">
                {formatDate(patient.dateOfBirth)}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{patient.gender}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">{patient.phone}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Address</span>
              <span className="info-value">{patient.address}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Wallet Address</span>
              <span className="info-value wallet">
                {patient.walletAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Records */}
        <div className="patient-records-section">
          <h2>Medical Records ({records.length})</h2>

          {records.length === 0 ? (
            <div className="placeholder">
              <p>No medical records found for this patient.</p>
            </div>
          ) : (
            <div className="records-list">
              {records.map((record) => {
                const type = record.type || record.recordType;
                const status = record.status;
                const date =
                  record.date || record.recordDate || record.createdAt;

                return (
                  <div key={record.id} className="record-card">
                    <div className="record-header">
                      <div>
                        <div className="record-title">
                          {record.title || record.name}
                        </div>
                        {type && (
                          <span className={getRecordTypeClass(type)}>
                            {type}
                          </span>
                        )}
                      </div>

                      {status && (
                        <div className={getStatusClass(status)}>
                          <span>Status:</span>
                          <span>{status}</span>
                        </div>
                      )}
                    </div>

                    {record.description && (
                      <div className="record-description">
                        {record.description}
                      </div>
                    )}

                    <div className="record-meta">
                      {date && (
                        <div className="record-meta-item">
                          <strong>Date:</strong> {formatDate(date)}
                        </div>
                      )}

                      {record.doctor && (
                        <div className="record-meta-item">
                          <strong>Doctor:</strong> {record.doctor}
                        </div>
                      )}

                      {record.hospital && (
                        <div className="record-meta-item">
                          <strong>Hospital:</strong> {record.hospital}
                        </div>
                      )}

                      {record.blockchainHash && (
                        <div className="record-meta-item">
                          <strong>Hash:</strong> {record.blockchainHash}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
