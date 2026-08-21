import React from 'react';
import './Guide.css';
import { Sprout, Activity, Image as ImageIcon } from 'lucide-react';

function Guide({ supportedCrops }) {
  return (
    <div className="about-container">
      <div className="about-header">
        <h2>Guide</h2>
        <p>Plant disease detection using deep learning</p>
      </div>

      <div className="about-section">
        <h3>
          <Sprout size={20} className="guide-icon" />
          Supported Crops ({supportedCrops.length})
        </h3>
        <p className="guide-description">
          This neural network has been specifically trained on the comprehensive PlantVillage dataset to detect healthy conditions as well as bacterial, viral, and fungal diseases for the following plants:
        </p>
        <div className="crop-list-chips">
          {supportedCrops.map((crop, idx) => (
            <span key={idx} className="crop-chip">{crop}</span>
          ))}
        </div>
      </div>

      <div className="about-section">
        <h3>
          <Activity size={20} className="guide-icon" />
          Tips for better predictions
        </h3>
        <div className="steps-list">
          <div className="step-item">
            <div className="step-num">1</div>
            <div className="step-text">
              <h4>Isolate the leaf</h4>
              <p>Place a single leaf flat against a neutral, high-contrast background (such as white, grey, or brown) to avoid crop-detection confusion.</p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-num">2</div>
            <div className="step-text">
              <h4>Verify good lighting</h4>
              <p>Ensure there are no heavy shadows or lens glares that might mask leaf veins, lesions, or powdery patches.</p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-num">3</div>
            <div className="step-text">
              <h4>Focus and center</h4>
              <p>Hold the camera steady, center the leaf pathology inside the frame, and ensure the image is sharp and not blurry before capture.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h3>
          <ImageIcon size={20} className="guide-icon" />
          How the app works
        </h3>
        <p className="guide-info-text">
          This is a decoupled client-server web app. The client-side dashboard is built with <b>React.js</b>, 
          serving a highly responsive SPA with <b>Vite</b>. All network requests are routed to a local 
          or remote <b>FastAPI</b> Python server which loads <b>TensorFlow Keras</b> deep learning weights. 
          Images are resized, converted to RGB vectors, and forwarded through a CNN model to predict the disease with high precision.
        </p>
      </div>
    </div>
  );
}

export default Guide;