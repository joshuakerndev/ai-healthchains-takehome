import React, { useState, useEffect } from 'react';
import './TransactionHistory.css';
import { apiService } from '../services/apiService';

const TransactionHistory = ({ account }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getTransactions(account || null, 20);
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.transactions)) {
        items = data.transactions;
      }

      setTransactions(items);
    } catch (err) {
      console.error('Failed to load transactions', err);
      setError(err?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const formatAddress = (address) => {
    if (!address) return '';
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return timestamp;
    return d.toLocaleString();
  };

  const getTypeClass = (type) => {
    if (!type) return 'transaction-type';
    const t = type.toLowerCase();
    if (t.includes('consent')) return 'transaction-type consent_approval';
    if (t.includes('data')) return 'transaction-type data_access';
    return 'transaction-type';
  };

  const getStatusClass = (status) => {
    if (!status) return 'transaction-status';
    const s = status.toLowerCase();
    if (s.includes('confirm')) return 'transaction-status confirmed';
    if (s.includes('pending')) return 'transaction-status pending';
    return 'transaction-status';
  };

  if (loading) {
    return (
      <div className="transaction-history-container">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="transaction-history-container">
      <div className="transaction-header">
        <h2>Transaction History</h2>
        {account && (
          <div className="wallet-filter">
            Filtering for: {formatAddress(account)}
          </div>
        )}
      </div>

      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="placeholder">
            <p>No transactions found.</p>
          </div>
        ) : (
          transactions.map((tx, index) => {
            const type = tx.type;
            const status = tx.status;
            const timestamp =
              tx.timestamp || tx.createdAt || tx.blockchainTimestamp;

            const fromAddress = tx.from || tx.fromAddress;
            const toAddress = tx.to || tx.toAddress;
            const amount = tx.amount;
            const currency = tx.currency || tx.tokenSymbol;
            const hash = tx.blockchainTxHash || tx.txHash;

            return (
              <div
                key={tx.id || hash || index}
                className="transaction-card"
              >
                <div className="transaction-header-info">
                  <div>
                    {type && (
                      <span className={getTypeClass(type)}>
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

                <div className="transaction-details">
                  {fromAddress && (
                    <div className="transaction-detail-item">
                      <span className="transaction-detail-label">From</span>
                      <span className="transaction-detail-value address">
                        {formatAddress(fromAddress)}
                      </span>
                    </div>
                  )}

                  {toAddress && (
                    <div className="transaction-detail-item">
                      <span className="transaction-detail-label">To</span>
                      <span className="transaction-detail-value address">
                        {formatAddress(toAddress)}
                      </span>
                    </div>
                  )}

                  {(amount != null || currency) && (
                    <div className="transaction-detail-item">
                      <span className="transaction-detail-label">Amount</span>
                      <span className="transaction-detail-value transaction-amount">
                        {amount != null ? amount : '--'}{' '}
                        {currency || ''}
                      </span>
                    </div>
                  )}

                  {hash && (
                    <div className="transaction-detail-item">
                      <span className="transaction-detail-label">
                        Tx Hash
                      </span>
                      <span className="transaction-detail-value hash">
                        {hash}
                      </span>
                    </div>
                  )}
                </div>

                {timestamp && (
                  <div className="transaction-timestamp">
                    {formatDate(timestamp)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
