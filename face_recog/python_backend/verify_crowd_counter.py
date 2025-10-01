import sys
import traceback

def verify_dependencies():
    print("Verifying dependencies...")
    
    dependencies = [
        'torch', 'torchvision', 'ultralytics', 
        'cv2', 'numpy', 'PIL', 'base64'
    ]
    
    for dep in dependencies:
        try:
            __import__(dep)
            print(f"✓ {dep} imported successfully")
        except ImportError:
            print(f"✗ {dep} not found")
    
    try:
        from crowd_counter import CrowdCounter
        print("✓ CrowdCounter class imported successfully")
    except Exception as e:
        print("✗ Error importing CrowdCounter:")
        print(traceback.format_exc())

def test_crowd_counter():
    from crowd_counter import CrowdCounter
    
    print("\nTesting CrowdCounter...")
    try:
        crowd_counter = CrowdCounter()
        print("✓ CrowdCounter initialized successfully")
        
        # Test with a dummy base64 image (replace with actual test image)
        dummy_base64_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
        
        result = crowd_counter.count_people_in_image(dummy_base64_image)
        print("Crowd Counting Result:")
        print(f"Success: {result.get('success', False)}")
        print(f"Total People: {result.get('total_count', 'N/A')}")
        
    except Exception as e:
        print("✗ Error in crowd counting:")
        print(traceback.format_exc())

if __name__ == '__main__':
    verify_dependencies()
    test_crowd_counter()
