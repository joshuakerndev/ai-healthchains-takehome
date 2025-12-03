import React, { useState, useEffect } from 'react';
import './PatientList.css';
import { apiService } from '../services/apiService';

const PAGE_SIZE = 10;

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const PatientList = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getPatients(
        currentPage,
        PAGE_SIZE,
        searchTerm.trim()
      );

      setPatients(response.patients || []);
      setPagination(response.pagination || null);
    } catch (err) {
      console.error('Failed to fetch patients', err);
      setError(err?.message || 'Failed to load patients');
      setPatients([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (loading && patients.length === 0) {
    return (
      <div className="patient-list-container">
        <div className="loading">Loading patients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-list-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h2>Patients</h2>

        <input
          type="text"
          placeholder="Search patients..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="patient-list">
        {patients.length === 0 ? (
          <div className="placeholder">
            <p>No patients found.</p>
          </div>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="patient-card"
              onClick={() => onSelectPatient && onSelectPatient(patient.id)}
            >
              <div className="patient-card-header">
                <div>
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-id">{patient.patientId}</div>
                </div>
                <div className="patient-id">
                  {formatDate(patient.createdAt)}
                </div>
              </div>

              <div className="patient-info">
                <div className="patient-info-item">
                  <strong>DOB:</strong> {formatDate(patient.dateOfBirth)}
                </div>
                <div className="patient-info-item">
                  <strong>Gender:</strong> {patient.gender}
                </div>
                <div className="patient-info-item">
                  <strong>Email:</strong> {patient.email}
                </div>
                <div className="patient-info-item">
                  <strong>Phone:</strong> {patient.phone}
                </div>
                <div className="patient-info-item">
                  <strong>Address:</strong> {patient.address}
                </div>
              </div>

              <div className="patient-wallet">
                {patient.walletAddress}
              </div>
            </div>
          ))
        )}
      </div>

      {pagination && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages} &middot;{' '}
            {pagination.total} patients
          </span>

          <button
            onClick={() =>
              setCurrentPage((p) =>
                pagination.totalPages
                  ? Math.min(pagination.totalPages, p + 1)
                  : p + 1
              )
            }
            disabled={
              !pagination.totalPages || pagination.page >= pagination.totalPages
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientList;
