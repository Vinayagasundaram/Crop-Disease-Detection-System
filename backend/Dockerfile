FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for OpenCV and download tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies (TensorFlow-CPU reduces container footprint)
RUN pip install --no-cache-dir \
    fastapi==0.110.0 \
    uvicorn==0.28.0 \
    tensorflow-cpu==2.15.0 \
    numpy==1.26.4 \
    opencv-python-headless==4.9.0.80 \
    python-multipart==0.0.9 \
    pillow==10.2.0 \
    google-generativeai==0.4.1 \
    python-dotenv==1.0.1

# Copy application files (referencing repository root context)
COPY ./backend/main.py /app/backend/main.py

# Download the model weights directly from the GitHub Release asset
RUN curl -L -o /app/plant_disease.keras https://github.com/Vinayagasundaram/Crop-Disease-Detection-System/releases/download/v1.0/plant_disease.keras

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
