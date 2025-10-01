import numpy as np
import cv2
from mtcnn import MTCNN
from keras_facenet import FaceNet
import base64
import io
from PIL import Image
from face_storage import FaceStorage  # Import the new storage module

class FaceRecognitionSystem:
    def __init__(self, threshold=0.6):
        """
        Initialize face recognition system
        
        Args:
            threshold (float): Similarity threshold for face recognition
        """
        # Face detection
        self.detector = MTCNN()
        
        # Face embedding
        self.embedder = FaceNet()
        
        # Face storage
        self.storage = FaceStorage()
        
        # Recognition threshold
        self.threshold = threshold

    def _preprocess_image(self, image):
        """
        Preprocess image for face detection
        
        Args:
            image (numpy.ndarray): Input image
        
        Returns:
            numpy.ndarray: Preprocessed image
        """
        # Ensure image is a numpy array
        if not isinstance(image, np.ndarray):
            raise ValueError("Input must be a numpy array")
        
        # Convert to RGB if needed
        if len(image.shape) == 2 or image.shape[2] == 1:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        elif image.shape[2] == 4:
            image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
        
        # Ensure the image is in the correct format for MTCNN
        image = image.astype(np.uint8)
        
        return image

    def detect_faces(self, image):
        """
        Detect faces in an image
        
        Args:
            image (numpy.ndarray): Input image
        
        Returns:
            list: Detected faces with coordinates and embeddings
        """
        # Preprocess image
        image = self._preprocess_image(image)
        
        # Detect faces
        faces = self.detector.detect_faces(image)
        
        detected_faces = []
        for face in faces:
            x, y, w, h = face['box']
            
            # Ensure face coordinates are within image bounds
            x = max(0, x)
            y = max(0, y)
            w = min(w, image.shape[1] - x)
            h = min(h, image.shape[0] - y)
            
            # Extract face region
            try:
                face_img = image[y:y+h, x:x+w]
                
                # Resize face image to a consistent size
                face_img = cv2.resize(face_img, (160, 160))
                
                # Generate embedding
                embedding = self.embedder.embeddings([face_img])[0]
                
                detected_faces.append({
                    'box': [x, y, w, h],
                    'embedding': embedding,
                    'confidence': face['confidence']
                })
            except Exception as e:
                print(f"Error processing face: {e}")
        
        return detected_faces

    def register_face(self, image_base64, name, metadata=None):
        """
        Register a new face
        
        Args:
            image_base64 (str or list): Base64 encoded image
            name (str): Name associated with the face
            metadata (dict, optional): Additional metadata
        
        Returns:
            dict: Registration result
        """
        try:
            # Handle case where image_base64 might be a list
            if isinstance(image_base64, list):
                image_base64 = image_base64[0] if image_base64 else ''
            
            # Decode base64 image
            if 'base64,' in image_base64:
                image_base64 = image_base64.split('base64,')[-1]
            
            image_bytes = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_bytes))
            image_np = np.array(image)
            
            # Detect faces
            faces = self.detect_faces(image_np)
            
            if not faces:
                return {
                    'success': False, 
                    'message': 'No face detected in the image'
                }
            
            # Use the first detected face
            face = faces[0]
            
            # Register face in storage
            face_id = self.storage.register_face(
                name=name, 
                embedding=face['embedding'], 
                images=[image_base64],
                metadata=metadata
            )
            
            return {
                'success': True, 
                'message': 'Face registered successfully',
                'face_id': face_id
            }
        
        except Exception as e:
            print(f"Face registration error: {e}")
            return {
                'success': False, 
                'message': str(e)
            }

    def recognize_faces(self, image_base64):
        """
        Recognize faces in an image
        
        Args:
            image_base64 (str): Base64 encoded image
        
        Returns:
            dict: Recognition results
        """
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_base64.split(',')[-1])
            image = Image.open(io.BytesIO(image_bytes))
            image_np = np.array(image)
            
            # Detect faces in the input image
            detected_faces = self.detect_faces(image_np)
            
            # Get registered faces
            registered_faces = self.storage.get_registered_faces()
            
            results = []
            for detected_face in detected_faces:
                best_match = None
                best_distance = float('inf')
                
                for registered_face in registered_faces:
                    # Calculate cosine distance
                    distance = np.linalg.norm(
                        detected_face['embedding'] - registered_face['embedding']
                    )
                    
                    if distance < best_distance and distance < self.threshold:
                        best_distance = distance
                        best_match = registered_face
                
                result = {
                    'box': detected_face['box'],
                    'confidence': detected_face['confidence']
                }
                
                if best_match:
                    result.update({
                        'name': best_match['name'],
                        'match_distance': best_distance,
                        'metadata': best_match.get('metadata', {})
                    })
                else:
                    result['name'] = 'Unknown'
                
                results.append(result)
            
            return {
                'success': True,
                'faces': results
            }
        
        except Exception as e:
            print(f"Face recognition error: {e}")
            return {
                'success': False,
                'message': str(e)
            }

    def get_registered_users(self):
        """
        Retrieve all registered users
        
        Returns:
            list: Registered users
        """
        registered_faces = self.storage.get_registered_faces()
        return [
            {
                'name': face['name'], 
                'registration_date': face['registration_date'],
                'metadata': face.get('metadata', {})
            } 
            for face in registered_faces
        ]

    def delete_registered_user(self, name):
        """
        Delete a registered user
        
        Args:
            name (str): Name of the user to delete
        
        Returns:
            dict: Deletion result
        """
        try:
            result = self.storage.delete_face(name=name)
            
            if result:
                return {
                    'success': True,
                    'message': f'User {name} deleted successfully'
                }
            else:
                return {
                    'success': False,
                    'message': f'User {name} not found'
                }
        
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }
