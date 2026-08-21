import React from 'react';
import './History.css';
import { Trash2, History as HistoryIcon } from 'lucide-react';

function History({
  history,
  clearAllHistory,
  loadHistoryItemToView,
  deleteHistoryItem,
  setActiveTab
}) {
  return (
    <div>
      <div className="history-header">
        <div>
          <h2>Scan History</h2>
          <p className="history-subtitle">
            Previous scans saved in this browser.
          </p>
        </div>
        {history.length > 0 && (
          <button className="clear-history-btn" onClick={clearAllHistory}>
            <Trash2 size={15} />
            Clear All History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass-card empty-history-card">
          <div className="empty-state">
            <HistoryIcon size={64} className="empty-state-icon" />
            <h4>No History Logs Found</h4>
            <p>
              Your previous scans will appear here automatically.
            </p>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => setActiveTab('dashboard')}
            >
              Analyze Leaf Now
            </button>
          </div>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="history-card" 
              onClick={() => loadHistoryItemToView(item)}
            >
              <div className="history-img-wrapper">
                <img src={item.thumbnail} alt="Diagnosis scan" className="history-img" />
              </div>
              <div className="history-details">
                <div>
                  <h4 className="history-crop">{item.crop}</h4>
                  <p className="history-disease">{item.disease}</p>
                </div>
                <div className="history-meta">
                  <span className="history-conf">{item.confidence}% Match</span>
                  <span className="history-date">{item.date}</span>
                </div>
              </div>
              <button 
                className="history-delete-btn" 
                onClick={(e) => deleteHistoryItem(item.id, e)}
                title="Delete record"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;