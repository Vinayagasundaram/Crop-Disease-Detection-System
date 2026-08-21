import os
import cv2
import json
import numpy as np
import tflite_runtime.interpreter as tflite
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env
load_dotenv()



app = FastAPI(title="Crop Disease Detection API", version="1.1.0")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the keras model
MODEL_NAME = "plant_disease.tflite"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(BASE_DIR, MODEL_NAME)

if not os.path.exists(model_path):
    model_path = os.path.join(os.getcwd(), MODEL_NAME)

print(f"Loading model from: {model_path}")
try:
    interpreter = tflite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    print("TFLite model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    interpreter = None

# Configure Gemini if the API key is present
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_active = False

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_active = True
        print("Gemini API configured successfully!")
    except Exception as e:
        print(f"Failed to configure Gemini: {e}")

# Class names list corresponding to model indices
class_names = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot',
    'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot',
    'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image.")
        
    H, W, C = 224, 224, 3
    img = cv2.resize(img, (H, W))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = np.array(img).astype("float32") / 255.0
    img = img.reshape(1, H, W, C)
    return img

async def query_gemini_details(crop: str, disease: str) -> dict:
    """Fetch description, symptoms, and cure guidelines using Gemini."""
    prompt = f"""
    You are an expert agricultural plant pathologist.
    A crop monitoring scanner has analyzed a leaf and identified:
    Crop: {crop}
    Condition/Disease: {disease}

    Provide detailed information about this plant pathology condition.
    Respond strictly in JSON format. Do not write any markdown code blocks, backticks, or extra text.
    The response must follow this exact JSON structure:
    {{
        "description": "A detailed 1-2 sentence description explaining the cause, pathogen, and impact of the disease/condition.",
        "symptoms": [
            "symptom detail 1",
            "symptom detail 2",
            "symptom detail 3"
        ],
        "treatment": [
            "action/treatment step 1",
            "action/treatment step 2",
            "action/treatment step 3"
        ]
    }}
    """
    try:
        # Use gemini-3.6-flash as it is fast, free, and accurate
        llm = genai.GenerativeModel('gemini-3.6-flash')
        response = llm.generate_content(prompt)
        text = response.text.strip()
        
        # Clean any accidental markdown codeblock styling if outputted
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        return json.loads(text)
    except Exception as e:
        print(f"Gemini API request failed: {e}. Falling back to local data.")
        return None

@app.get("/health")
def health_check():
    if model is None:
        return {"status": "unhealthy", "message": f"Model '{MODEL_NAME}' could not be loaded."}
    return {
        "status": "healthy",
        "model": MODEL_NAME,
        "gemini_active": gemini_active
    }

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    if interpreter is None:
        raise HTTPException(status_code=503, detail="TFLite model is not loaded.")
        
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")
        
    try:
        contents = await file.read()
        preprocessed_img = preprocess_image(contents)
        
        # Predict using TFLite interpreter
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], preprocessed_img)
        # Run inference
        interpreter.invoke()
        # Get predictions
        raw_predictions = interpreter.get_tensor(output_details[0]['index'])[0]
        
        result_index = int(np.argmax(raw_predictions))
        confidence = float(np.max(raw_predictions) * 100.0)
        
        if result_index >= len(class_names):
            raise HTTPException(status_code=500, detail="Prediction index out of bounds.")
            
        class_key = class_names[result_index]
        
        # Pre-split crop and disease name
        parts = class_key.split("___")
        crop_name = parts[0].replace("_", " ").title()
        disease_name = parts[1].replace("_", " ").replace("healthy", "Healthy").title()
        
        status = 'Diseased' if 'healthy' not in class_key.lower() else 'Healthy'
        
        ai_details = None
        # Attempt to get information from Gemini
        if gemini_active:
            ai_details = await query_gemini_details(crop_name, disease_name)
            
        # Fall back to generic placeholder if Gemini was offline/errored/inactive
        if not ai_details:
            ai_details = {
                "description": f"Diagnosis details for {crop_name} - {disease_name} could not be retrieved from Gemini. Verify your internet connection or check if GEMINI_API_KEY is set in your environment.",
                "symptoms": ["Check crop leaf spots, mold patches, and leaf margins for physical signs of infection."],
                "treatment": ["Isolate the infected plant and verify treatment measures with local agricultural extensions."]
            }
        
        return {
            "class_key": class_key,
            "crop": crop_name,
            "disease": disease_name,
            "status": status,
            "confidence": round(confidence, 2),
            "description": ai_details["description"],
            "symptoms": ai_details["symptoms"],
            "treatment": ai_details["treatment"]
        }
        
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
