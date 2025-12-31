import os
import numpy as np
import tensorflow as tf
from PIL import Image
from django.conf import settings

MODEL_PATH = os.path.join(settings.BASE_DIR, 'model', 'efficientnet_b0.h5')
model = None

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ ML Model Loaded")
except:
    print("⚠️ ML Model not found. Using dummy mode.")

def predict_xray(image_file):
    if not model:
        return "Negative", 85.5, "Low" # Dummy fallback
        
    img = Image.open(image_file).convert('RGB')
    img = img.resize((128, 128))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    
    prediction = model.predict(img_array)
    score = float(prediction[0][0])
    
    ifKP = score > 0.5
    return ("Positive" if ifKP else "Negative", 
            round(score * 100 if ifKP else (1-score)*100, 2), 
            "High" if score > 0.8 else "Low")