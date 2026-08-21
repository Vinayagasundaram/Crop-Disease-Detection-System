FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements or directly install dependencies
# Using tensorflow-cpu instead of full tensorflow makes the container significantly smaller
RUN pip install --no-cache-dir \
    fastapi==0.110.0 \
    uvicorn==0.28.0 \
    tensorflow-cpu==2.15.0 \
    numpy==1.26.4 \
    opencv-python-headless==4.9.0.80 \
    python-multipart==0.0.9 \
    pillow==10.2.0

# Copy application files
COPY ./disease_data.py /app/backend/disease_data.py
COPY ./main.py /app/backend/main.py

# In typical Docker setups, copy the model into the app root
# When deploying, ensure plant_disease.keras is built into this folder
COPY ../plant_disease.keras /app/plant_disease.keras

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
