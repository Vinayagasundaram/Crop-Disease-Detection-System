# 🌿 CropGuard AI: Crop Disease Detection System

An AI-powered web application that detects plant diseases in real time using a custom **TensorFlow Lite CNN** model. Users upload a photograph of a crop leaf and receive an instant diagnosis along with detailed descriptions, identified symptoms, and organic treatment guidelines powered dynamically by the **Google Gemini API**.

---

## 📌 Overview

CropGuard AI helps farmers, researchers, and home gardeners quickly diagnose crop diseases and find remedies. By transitioning from a heavy TensorFlow server deployment to a lightweight hybrid edge-and-cloud architecture, the system loads instantly and runs efficiently on free-tier servers.

The application consists of:
* **Frontend:** React + Vite Single Page Application (SPA) with responsive CSS components.
* **Backend:** FastAPI REST API serving model predictions.
* **Machine Learning:** TensorFlow Lite (`tflite-runtime`) CNN classification model (trained on the PlantVillage dataset).
* **Generative AI:** Google Gemini API (`gemini-3.6-flash`) for dynamic plant pathology insights.

---

## ✨ Features

* **Real-Time Leaf Diagnostics:** Upload an image of a leaf to get instant disease classification and confidence scores.
* **AI Pathologist Advice:** Dynamic generation of disease descriptions, symptoms, and organic treatment steps using the Gemini API.
* **History Logs:** Saves past diagnostic history locally in the browser storage for easy review.
* **Mobile-Responsive UI:** Flat, modern layout styled with modular CSS classes.
* **Robust Offline Fallback:** Integrated local dictionary checks to serve fallback descriptions if the Gemini API is offline or rate-limited.
* **Low-Memory footprint:** Runs on under 50 MB of memory using the optimized `.tflite` model format.

---

## 🛠 Tech Stack

### Frontend
* React.js
* Vite
* Axios
* Lucide React

### Backend
* FastAPI (Python)
* tflite-runtime (TensorFlow Lite interpreter)
* OpenCV (headless image processing)
* NumPy
* Uvicorn

### Generative AI
* Google Generative AI SDK (`gemini-3.6-flash`)

---

## 📁 Project Structure

```text
Crop-Disease-Detection-System
│
├── backend
│   ├── main.py
│   └── Dockerfile
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   ├── utils
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
│
├── plant_disease.tflite
├── .gitignore
└── README.md
```

---

## 📊 Supported Crops

The classifier has been trained on the comprehensive **PlantVillage** dataset to detect healthy states and multiple infections for the following crops:

* 🍎 Apple
* 🫐 Blueberry
* 🍒 Cherry
* 🌽 Corn (Maize)
* 🍇 Grape
* 🍊 Orange
* 🍑 Peach
* 🫑 Pepper (Bell)
* 🥔 Potato
* 🍓 Strawberry
* 🍅 Tomato
* 🍃 Raspberry, Squash, & Soybean

---

## ⚙️ Installation & Running Locally

### 1. Prerequisites
Make sure you have **Node.js** and **Python 3.10+** installed on your system.

### 2. Configure Environment Variables
Create a `.env` file in the **root** folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Backend Server
```bash
# Navigate to backend folder
cd backend

# Install Python packages
pip install fastapi uvicorn tflite-runtime numpy opencv-python-headless python-multipart pillow python-dotenv google-generativeai

# Start the FastAPI server
python main.py
```
*The API server will listen at `http://localhost:8000`.*

### 4. Run the Frontend Client
Open a second terminal window:
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```
*Open `http://localhost:5173` in your browser to view the application.*

---

## 🐳 Docker & Production Deployment

### Backend (Render / Cloud Run)
1. Set the **Dockerfile Path** to `backend/Dockerfile` and leave the **Root Directory** empty in your Render dashboard settings.
2. Under **Environment Variables**, add `GEMINI_API_KEY`.
3. Create a GitHub Release (e.g. `v1.0`) and upload `plant_disease.tflite` as a binary asset. The Dockerfile will automatically fetch the model weights during build.

### Frontend (Vercel)
1. Import the repository, selecting the `frontend` folder as the root.
2. Add the environment variable `VITE_API_URL` pointing to your deployed backend URL.
