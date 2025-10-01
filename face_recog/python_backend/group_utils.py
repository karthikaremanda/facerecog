import numpy as np
import cv2
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
from PIL import Image
from typing import List, Dict, Tuple, Optional
import os
import base64
import io
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GroupAnalyzer:
    def __init__(self, model_path: str = None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        
        # Initialize MTCNN with lower thresholds for better detection
        self.mtcnn = MTCNN(
            keep_all=True,
            device=self.device,
            min_face_size=20,
            thresholds=[0.6, 0.7, 0.7],  # Default is [0.6, 0.7, 0.7]
            factor=0.709  # Default is 0.709
        )
        
        self.resnet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
        self.registered_faces_dir = "registered_faces"
        self.threshold = 0.6
        self.registered_embeddings = self._load_registered_embeddings()
        
        logger.info(f"Loaded {len(self.registered_embeddings)} registered faces")

    def _load_registered_embeddings(self) -> Dict[str, np.ndarray]:
        embeddings = {}
        if os.path.exists(self.registered_faces_dir):
            for file in os.listdir(self.registered_faces_dir):
                if file.endswith('.npy'):
                    name = file[:-4]  # Remove .npy extension
                    embedding_path = os.path.join(self.registered_faces_dir, file)
                    embeddings[name] = np.load(embedding_path)
        return embeddings

    def _process_image(self, image: Image.Image) -> Tuple[torch.Tensor, List[List[int]]]:
        try:
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if image is too large
            max_size = 1600
            if max(image.size) > max_size:
                ratio = max_size / max(image.size)
                new_size = tuple(int(dim * ratio) for dim in image.size)
                image = image.resize(new_size, Image.Resampling.LANCZOS)
                logger.info(f"Resized image to {new_size}")

            # Convert to tensor for MTCNN
            img_tensor = torch.FloatTensor(np.array(image)).permute(2, 0, 1).unsqueeze(0)
            
            # Detect faces with batched detection
            boxes, probs = self.mtcnn.detect(img_tensor)
            
            logger.info(f"Detected {len(boxes) if boxes is not None else 0} faces")
            
            if boxes is None:
                return None, []

            faces = []
            face_boxes = []
            
            for box, prob in zip(boxes, probs):
                if prob < 0.9:  # Skip low confidence detections
                    continue
                    
                box = box.astype(int)
                # Ensure box coordinates are within image bounds
                box[0] = max(0, box[0])
                box[1] = max(0, box[1])
                box[2] = min(image.size[0], box[2])
                box[3] = min(image.size[1], box[3])
                
                if box[2] - box[0] < 20 or box[3] - box[1] < 20:  # Skip tiny faces
                    continue
                
                try:
                    face = image.crop((box[0], box[1], box[2], box[3]))
                    face = face.resize((160, 160), Image.Resampling.LANCZOS)
                    face_tensor = torch.FloatTensor(np.array(face)).permute(2, 0, 1).unsqueeze(0)
                    faces.append(face_tensor)
                    face_boxes.append(box.tolist())
                except Exception as e:
                    logger.error(f"Error processing face: {e}")
                    continue

            if not faces:
                return None, []

            faces_tensor = torch.cat(faces, dim=0)
            return faces_tensor, face_boxes
            
        except Exception as e:
            logger.error(f"Error in _process_image: {e}")
            return None, []

    def _get_embeddings(self, faces_tensor: torch.Tensor) -> np.ndarray:
        with torch.no_grad():
            embeddings = self.resnet(faces_tensor.to(self.device))
        return embeddings.cpu().numpy()

    def _match_face(self, embedding: np.ndarray) -> Tuple[str, float]:
        best_match = None
        best_distance = float('inf')
        
        for name, registered_embedding in self.registered_embeddings.items():
            distance = np.linalg.norm(embedding - registered_embedding)
            if distance < best_distance:
                best_distance = distance
                best_match = name

        if best_distance > self.threshold:
            return "Unknown", best_distance
        return best_match, best_distance

    def analyze_group(self, image: Image.Image) -> Dict:
        try:
            # Process image and get face embeddings
            faces_tensor, face_boxes = self._process_image(image)
            
            if faces_tensor is None:
                return {
                    "success": False,
                    "message": "No faces detected in the image",
                    "faces": []
                }

            embeddings = self._get_embeddings(faces_tensor)
            
            # Match each face
            results = []
            for embedding, box in zip(embeddings, face_boxes):
                name, confidence = self._match_face(embedding)
                results.append({
                    "name": name,
                    "confidence": float(1 - confidence/2),  # Convert distance to confidence score
                    "box": box
                })

            return {
                "success": True,
                "message": f"Found {len(results)} faces",
                "faces": results
            }
            
        except Exception as e:
            logger.error(f"Error in analyze_group: {e}")
            return {
                "success": False,
                "message": f"Error analyzing group: {str(e)}",
                "faces": []
            }

    def verify_group(self, image: Image.Image, required_users: List[str]) -> Dict:
        try:
            # First perform group analysis
            analysis_result = self.analyze_group(image)
            
            if not analysis_result["success"]:
                return analysis_result

            # Get detected names
            detected_names = [result["name"] for result in analysis_result["faces"]]
            detected_names = [name for name in detected_names if name != "Unknown"]

            # Find missing and extra users
            missing_users = [user for user in required_users if user not in detected_names]
            extra_users = [user for user in detected_names if user not in required_users]

            # Determine if group matches requirements
            verified = len(missing_users) == 0

            return {
                "success": True,
                "message": "Group verification completed",
                "faces": analysis_result["faces"],
                "verified": verified,
                "missing_users": missing_users,
                "extra_users": extra_users
            }
            
        except Exception as e:
            logger.error(f"Error in verify_group: {e}")
            return {
                "success": False,
                "message": f"Error verifying group: {str(e)}",
                "faces": [],
                "verified": False,
                "missing_users": required_users,
                "extra_users": []
            }

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

def process_group_image(image_data):
    """Process image for group analysis"""
    try:
        # Convert base64 to image
        image = base64_to_image(image_data)
        
        # Convert to RGB for MTCNN
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_pil = Image.fromarray(image_rgb)
        
        analyzer = GroupAnalyzer()
        result = analyzer.analyze_group(image_pil)
        
        # Add frame data back in response for live feed display
        result["frame"] = image_to_base64(image)
        return result

    except Exception as e:
        return {
            "success": False,
            "message": f"Error processing group image: {str(e)}"
        }

def verify_group(image_data, required_users):
    """Verify if all required users are present in the image"""
    try:
        # Convert base64 to image
        image = base64_to_image(image_data)
        
        # Convert to RGB for MTCNN
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_pil = Image.fromarray(image_rgb)
        
        analyzer = GroupAnalyzer()
        result = analyzer.verify_group(image_pil, required_users)
        
        # Add frame data back in response for live feed display
        result["frame"] = image_to_base64(image)
        return result

    except Exception as e:
        return {
            "success": False,
            "message": f"Error verifying group: {str(e)}"
        }
