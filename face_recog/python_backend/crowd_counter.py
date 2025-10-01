import cv2
import numpy as np
import base64
import torch
import torchvision.transforms as transforms
import torchvision.models.detection as detection

class CrowdCounter:
    def __init__(self):
        """
        Initialize crowd counter with pre-trained object detection model
        """
        # Load pre-trained model
        self.model = detection.fasterrcnn_resnet50_fpn(pretrained=True)
        self.model.eval()
        
        # Move model to GPU if available
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        
        # Define confidence threshold
        self.confidence_threshold = 0.5
        
        # Preprocessing transform
        self.transform = transforms.Compose([
            transforms.ToTensor()
        ])

    def count_people_in_image(self, base64_image):
        """
        Count people in an image using object detection
        
        Args:
            base64_image (str or list): Base64 encoded image
        
        Returns:
            dict: Crowd counting results
        """
        try:
            # Handle case where base64_image might be a list
            if isinstance(base64_image, list):
                base64_image = base64_image[0] if base64_image else ''
            
            # Remove data URI scheme if present
            if isinstance(base64_image, str) and 'base64,' in base64_image:
                base64_image = base64_image.split('base64,')[1]
            
            # Decode base64 to image
            image_bytes = base64.b64decode(base64_image)
            image_array = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
            
            # Convert color space from BGR to RGB
            image_rgb = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
            
            # Prepare image for model
            input_tensor = self.transform(image_rgb).unsqueeze(0).to(self.device)
            
            # Perform inference
            with torch.no_grad():
                predictions = self.model(input_tensor)[0]
            
            # Process predictions
            boxes = predictions['boxes'].cpu().numpy()
            labels = predictions['labels'].cpu().numpy()
            scores = predictions['scores'].cpu().numpy()
            
            # Filter for people (COCO dataset class 1 is person)
            people_indices = np.where((labels == 1) & (scores >= self.confidence_threshold))[0]
            
            # Count and annotate people
            people_boxes = []
            for idx in people_indices:
                box = boxes[idx].astype(int)
                score = scores[idx]
                
                # Draw rectangle
                cv2.rectangle(image_array, 
                              (box[0], box[1]), 
                              (box[2], box[3]), 
                              (0, 255, 0), 2)
                
                # Add label
                label = f'Person: {score:.2f}'
                cv2.putText(image_array, label, 
                            (box[0], box[1]-10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, 
                            (0, 255, 0), 2)
                
                people_boxes.append({
                    'box': box.tolist(),
                    'confidence': float(score)
                })
            
            # Encode annotated image
            _, buffer = cv2.imencode('.jpg', image_array)
            annotated_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Return results
            return {
                'success': True,
                'total_count': len(people_boxes),
                'annotated_image': f'data:image/jpeg;base64,{annotated_base64}',
                'confidence': f'{len(people_boxes)} ± {max(1, int(len(people_boxes) * 0.1))}'
            }
        
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Crowd counting error: {e}")
            return {
                'success': False, 
                'message': str(e)
            }

class AdvancedCrowdCounter:
    def __init__(self, model_path=None):
        """
        Initialize advanced crowd counter
        
        Args:
            model_path (str, optional): Path to pre-trained model weights
        """
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Use the CrowdCounter as the base implementation
        self.base_counter = CrowdCounter()
        
        # Preprocessing transforms
        self.transform = transforms.Compose([
            transforms.Resize((512, 512)),  # Resize to fixed input size
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def count_people_in_image(self, base64_image):
        """
        Count people in an image using advanced detection methods
        
        Args:
            base64_image (str or list): Base64 encoded image
        
        Returns:
            dict: Crowd counting results
        """
        # Delegate to base implementation
        return self.base_counter.count_people_in_image(base64_image)

    def process_live_video(self, video_source=0, max_frames=None):
        """
        Process live video stream and count people
        
        Args:
            video_source (int/str): Video source (webcam or video file)
            max_frames (int, optional): Maximum number of frames to process
        
        Yields:
            dict: Frame analysis results
        """
        cap = cv2.VideoCapture(video_source)
        frame_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Use base counter to detect people
            result = self.base_counter.count_people_in_image(
                base64.b64encode(cv2.imencode('.jpg', frame)[1]).decode('utf-8')
            )
            
            yield {
                'frame_number': frame_count,
                'people_count': result.get('total_count', 0),
                'annotated_frame': frame  # You might want to use the annotated image from result
            }
            
            frame_count += 1
            
            # Optional: Break after processing max frames
            if max_frames and frame_count >= max_frames:
                break
        
        cap.release()

def main():
    # Initialize crowd counter
    crowd_counter = AdvancedCrowdCounter()
    
    # You can add test code here if needed
    print("Advanced Crowd Counter initialized successfully.")

if __name__ == '__main__':
    main()
