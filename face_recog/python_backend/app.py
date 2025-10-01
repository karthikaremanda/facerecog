from flask import Flask, request, jsonify
from flask_cors import CORS
from face_recognition_system import FaceRecognitionSystem
from crowd_counter import AdvancedCrowdCounter
import logging

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Initialize face recognition system
face_system = FaceRecognitionSystem()

# Initialize crowd counter
crowd_counter = AdvancedCrowdCounter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/register-face', methods=['POST'])
def register_face_endpoint():
    try:
        data = request.json
        
        # Validate input
        if not data or 'name' not in data:
            return jsonify({"success": False, "message": "Name is required"}), 400
        
        # Check for images
        images = data.get('images', [])
        if not images:
            return jsonify({"success": False, "message": "At least one image is required"}), 400
        
        # Register face with detailed response
        result = face_system.register_face(images, data['name'])
        logger.info(f"Registration result for {data['name']}: {result}")
        
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/identify-face', methods=['POST'])
def identify_face_endpoint():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"success": False, "message": "Image is required"}), 400

        result = face_system.recognize_faces(data['image'])
        logger.info(f"Identification result: {result}")
        
        # Format the response for better display
        if result['success']:
            formatted_faces = []
            for face in result['faces']:
                formatted_face = {
                    "name": face.get('name', 'Unknown'),
                    "confidence": round(face['confidence'] * 100, 2) if face['confidence'] > 0 else 0,
                    "box": face['box']
                }
                formatted_faces.append(formatted_face)
            
            response = {
                "success": True,
                "message": f"Detected {len(result['faces'])} faces",
                "results": formatted_faces
            }
        else:
            response = result

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Identification error: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/analyze-group', methods=['POST'])
def analyze_group_endpoint():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"success": False, "message": "Image is required"}), 400

        result = face_system.recognize_faces(data['image'])
        logger.info(f"Group analysis result: {result}")
        
        # Format the response for better display
        if result['success']:
            formatted_faces = []
            for face in result['faces']:
                formatted_face = {
                    "name": face.get('name', 'Unknown'),
                    "confidence": round(face['confidence'] * 100, 2) if face['confidence'] > 0 else 0,
                    "box": face['box']
                }
                formatted_faces.append(formatted_face)
            
            response = {
                "success": True,
                "message": f"Detected {len(result['faces'])} faces",
                "total_faces": len(result['faces']),
                "identified_count": len([f for f in result['faces'] if f.get('name', 'Unknown') != 'Unknown']),
                "faces": formatted_faces
            }
        else:
            response = result

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Group analysis error: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/crowd-count', methods=['POST'])
def crowd_count_endpoint():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"success": False, "message": "Image is required"}), 400

        result = crowd_counter.count_people_in_image(data['image'])
        logger.info(f"Advanced crowd counting result: {result}")
        
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Advanced crowd counting error: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/registered-users', methods=['GET'])
def get_registered_users():
    try:
        # Use the new method to get registered users
        users = face_system.get_registered_users()
        
        # Format the response
        response = {
            "success": True,
            "users": users
        }
        
        logger.info(f"Retrieved {len(users)} registered users")
        return jsonify(response), 200
    
    except Exception as e:
        logger.error(f"Error retrieving registered users: {str(e)}")
        return jsonify({
            "success": False, 
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
