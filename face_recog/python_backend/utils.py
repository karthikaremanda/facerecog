import cv2
import numpy as np
from keras_facenet import FaceNet
import os
import base64
from PIL import Image
import io

# Initialize FaceNet
embedder = FaceNet()

# Directory to save registered faces
REGISTERED_FACES_DIR = os.path.join(os.path.dirname(__file__), 'registered_faces')
if not os.path.exists(REGISTERED_FACES_DIR):
    os.makedirs(REGISTERED_FACES_DIR)

def base64_to_image(base64_string):
    """Convert base64 string to image array"""
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    img_data = base64.b64decode(base64_string)
    img = Image.open(io.BytesIO(img_data))
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

def image_to_base64(image):
    """Convert image array to base64 string"""
    _, buffer = cv2.imencode('.jpg', image)
    return base64.b64encode(buffer).decode('utf-8')

def detect_faces(image):
    """Detect faces in an image using OpenCV"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
    return faces

def get_face_embedding(face_img):
    """Get face embedding using FaceNet"""
    preprocessed_face = cv2.resize(face_img, (160, 160))
    return embedder.embeddings([preprocessed_face])[0]

def register_face(image_data, name):
    """Register a new face"""
    try:
        # Convert base64 to image
        image = base64_to_image(image_data)
        
        # Detect faces
        faces = detect_faces(image)
        
        if len(faces) == 0:
            return {"success": False, "message": "No face detected in the image"}
        
        if len(faces) > 1:
            return {"success": False, "message": "Multiple faces detected. Please use an image with a single face"}
        
        # Get the face region
        x, y, w, h = faces[0]
        face = image[y:y+h, x:x+w]
        
        # Get face embedding
        embedding = get_face_embedding(face)
        
        # Save embedding
        embedding_path = os.path.join(REGISTERED_FACES_DIR, f"{name}.npy")
        np.save(embedding_path, embedding)
        
        return {"success": True, "message": f"Face registered successfully for {name}"}
    
    except Exception as e:
        return {"success": False, "message": f"Error registering face: {str(e)}"}

def identify_face(image_data):
    """Identify a face from an image"""
    try:
        # Convert base64 to image
        image = base64_to_image(image_data)
        
        # Detect faces
        faces = detect_faces(image)
        
        if len(faces) == 0:
            return {"success": False, "message": "No face detected in the image"}
        
        results = []
        # Load registered embeddings
        registered_embeddings = []
        registered_names = []
        
        for filename in os.listdir(REGISTERED_FACES_DIR):
            if filename.endswith('.npy'):
                embedding = np.load(os.path.join(REGISTERED_FACES_DIR, filename))
                registered_embeddings.append(embedding)
                registered_names.append(filename.split('.')[0])
        
        for (x, y, w, h) in faces:
            face = image[y:y+h, x:x+w]
            embedding = get_face_embedding(face)
            
            if registered_embeddings:
                # Compare with registered faces
                distances = [np.linalg.norm(embedding - reg_embedding) 
                           for reg_embedding in registered_embeddings]
                
                min_distance_index = np.argmin(distances)
                min_distance = distances[min_distance_index]
                
                # Threshold for face matching
                threshold = 0.6
                
                if min_distance < threshold:
                    person_name = registered_names[min_distance_index]
                    confidence = 1 - (min_distance / threshold)
                    results.append({
                        "name": person_name,
                        "confidence": float(confidence),
                        "box": [int(x), int(y), int(w), int(h)]
                    })
                else:
                    results.append({
                        "name": "Unknown",
                        "confidence": 0.0,
                        "box": [int(x), int(y), int(w), int(h)]
                    })
        
        return {
            "success": True,
            "results": results,
            "message": f"Found {len(results)} faces"
        }
    
    except Exception as e:
        return {"success": False, "message": f"Error identifying face: {str(e)}"}

def get_registered_users():
    """Get list of registered users"""
    try:
        users = []
        for filename in os.listdir(REGISTERED_FACES_DIR):
            if filename.endswith('.npy'):
                users.append(filename.split('.')[0])
        return {"success": True, "users": users}
    except Exception as e:
        return {"success": False, "message": f"Error getting registered users: {str(e)}"}
