import React from 'react';
import './Dashboard.css';
import {
  Upload,
  Sprout,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { getConfidenceColor } from '../utils/helpers';

function Dashboard({ scanner, handlePredict }) {
  const {
    imagePreview,
    isDragActive,
    error,
    loading,
    prediction,
    selectedFile,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    triggerFileInput,
    handleFileChange,
    clearSelection
  } = scanner;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = prediction
    ? circumference - (prediction.confidence / 100) * circumference
    : circumference;

  return (
    <div className="dashboard-grid">
      <div className="glass-card">
        <h3 className="card-title">
          <Upload size={18} className="card-title-icon" />
          Leaf Analysis
        </h3>

        {!imagePreview ? (
          <div
            className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <div className="dropzone-icon-container">
              <Upload size={28} />
            </div>
            <div className="dropzone-text">
              <h4>Drag and drop your crop leaf image here</h4>
              <p>Supports PNG, JPG, JPEG files</p>
            </div>
            <button className="btn btn-primary btn-sm">
              Browse Files
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="file-input"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="preview-container">
            <div className="image-preview-wrapper">
              <img src={imagePreview} alt="Selected Leaf Preview" className="image-preview" />
              <button className="clear-btn" onClick={clearSelection} title="Remove image">
                <Trash2 size={16} />
              </button>
            </div>

            {error && (
              <div className="alert alert-danger">
                <AlertTriangle size={18} className="alert-icon" />
                <span>{error}</span>
              </div>
            )}

            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={handlePredict}
                disabled={loading || !selectedFile}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spinner-icon" />
                    Analyzing Leaf...
                  </>
                ) : (
                  <>
                    <Activity size={18} />
                    Analyze & Predict
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card">
        <h3 className="card-title">
          <Activity size={18} className="card-title-icon" />
          Diagnosis Output
        </h3>

        {loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Analyzing the leaf...</p>
            <div className="shimmer-bar"></div>
          </div>
        )}

        {!loading && !prediction && !error && (
          <div className="empty-state">
            <Sprout size={64} className="empty-state-icon" />
            <h4>Ready to Analyze</h4>
            <p>
              Upload a photograph of a crop leaf and click <b>Analyze</b> to display diagnosis intelligence.
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="empty-state error-state">
            <ShieldAlert size={64} className="error-state-icon" />
            <h4>Analysis Failed</h4>
            <p>
              Could not complete diagnosis. Make sure the FastAPI server is running on port 8000.
            </p>
          </div>
        )}

        {!loading && prediction && (
          <div>
            <div className="result-header">
              <div className="crop-badge-wrapper">
                <h4 className="crop-title">{prediction.crop}</h4>
                <p className="disease-name">{prediction.disease}</p>
                <span className={`status-badge ${prediction.status.toLowerCase() === 'healthy' ? 'healthy' : 'diseased'}`}>
                  {prediction.status.toLowerCase() === 'healthy' ? (
                    <>
                      <CheckCircle size={12} />
                      Healthy Leaf
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={12} />
                      Infection Detected
                    </>
                  )}
                </span>
              </div>

              <div className="radial-meter">
                <svg width="100" height="100">
                  <circle className="radial-bg" cx="50" cy="50" r={radius} />
                  <circle
                    className="radial-progress"
                    cx="50"
                    cy="50"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ stroke: getConfidenceColor(prediction.confidence) }}
                  />
                </svg>
                <div className="radial-text">
                  <span className="radial-value">{prediction.confidence}%</span>
                  <span className="radial-label">CONFIDENCE</span>
                </div>
              </div>
            </div>

            <div className="result-sections">
              <div className="result-section-card">
                <div className="result-section-title desc">
                  <FileText size={16} />
                  <span>Description</span>
                </div>
                <p className="description-text">{prediction.description}</p>
              </div>

              {prediction.symptoms && prediction.symptoms.length > 0 && prediction.symptoms[0] !== 'N/A' && (
                <div className="result-section-card">
                  <div className="result-section-title symptom">
                    <AlertTriangle size={16} />
                    <span>Identified Symptoms</span>
                  </div>
                  <ul className="bullet-list">
                    {prediction.symptoms.map((symptom, idx) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

              {prediction.treatment && prediction.treatment.length > 0 && prediction.treatment[0] !== 'N/A' && (
                <div className="result-section-card healthy-recommendation">
                  <div className="result-section-title cure">
                    <CheckCircle size={16} />
                    <span>Recommended Action & Remedies</span>
                  </div>
                  <ul className="bullet-list">
                    {prediction.treatment.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;