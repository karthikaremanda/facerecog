import base64
from crowd_counter import CrowdCounter

def test_crowd_counter():
    # Initialize crowd counter
    crowd_counter = CrowdCounter()

    # Test with a sample image (replace with an actual image path)
    with open('sample_crowd_image.jpg', 'rb') as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        
        # Perform crowd counting
        result = crowd_counter.count_people_in_image(base64_image)
        
        print("Crowd Counting Result:")
        print(f"Total People: {result.get('total_count', 'N/A')}")
        print(f"Success: {result.get('success', False)}")

if __name__ == '__main__':
    test_crowd_counter()
