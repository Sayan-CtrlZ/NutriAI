import json
import os

def load_mock_data():
    """Loads the mock data from the json file."""
    try:
        # Construct path relative to this file
        base_path = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_path, 'mock_data.json')
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading mock data: {e}")
        return []

# Load once at module level
MOCK_SAMPLES = load_mock_data()

def get_sample_by_id(sample_id):
    """Finds a sample by its ID."""
    for sample in MOCK_SAMPLES:
        if sample.get('id') == sample_id:
            return sample
    return None
  