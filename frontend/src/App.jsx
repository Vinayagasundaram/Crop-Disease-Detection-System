import React, { useState, useEffect } from 'react';
import { Sprout, History as HistoryIcon, Info } from 'lucide-react';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Guide from './components/Guide';
import { useCropScanner } from './hooks/useCropScanner';
import { SUPPORTED_CROPS } from './utils/constants';
import { createThumbnail, formatDate } from './utils/helpers';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [history, setHistory] = useState([]);

  const scanner = useCropScanner();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('crop_detection_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
    }
  }, []);

  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('crop_detection_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage:", e);
    }
  };

  const handlePredictSuccess = async (resultData) => {
    const thumbnail = await createThumbnail(scanner.imagePreview);
    if (!thumbnail) return;

    const historyItem = {
      id: Date.now().toString(),
      crop: resultData.crop,
      disease: resultData.disease,
      status: resultData.status,
      confidence: resultData.confidence,
      date: formatDate(new Date()),
      thumbnail
    };

    const updatedHistory = [historyItem, ...history.slice(0, 19)];
    saveHistory(updatedHistory);
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
  };

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire diagnosis history?")) {
      saveHistory([]);
    }
  };

  const loadHistoryItemToView = (item) => {
    scanner.setPrediction({
      crop: item.crop,
      disease: item.disease,
      status: item.status,
      confidence: item.confidence,
      description: "Retrieved from history log.",
      symptoms: ["Check details in the About tab or scan again for live advice."],
      treatment: ["Check details in the About tab or scan again for live advice."]
    });
    scanner.setImagePreview(item.thumbnail);
    scanner.setSelectedFile(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <span style={{ color: '#10b981' }}>CropGuard</span> <span className="logo-brand-suffix">AI</span>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Sprout size={16} />
            Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <HistoryIcon size={16} />
            History
            {history.length > 0 && (
              <span className="nav-badge">
                {history.length}
              </span>
            )}
          </button>
          <button
            className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Info size={16} />
            Guide
          </button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            scanner={scanner}
            handlePredict={() => scanner.handlePredict(handlePredictSuccess)}
          />
        )}

        {activeTab === 'history' && (
          <History
            history={history}
            clearAllHistory={clearAllHistory}
            loadHistoryItemToView={loadHistoryItemToView}
            deleteHistoryItem={deleteHistoryItem}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'about' && (
          <Guide supportedCrops={SUPPORTED_CROPS} />
        )}
      </main>

      <footer className="footer">
        <p>© 2026 CropGuard AI. Plant disease detection app</p>
      </footer>
    </div>
  );
}

export default App;