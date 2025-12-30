from flask import Blueprint, request, jsonify
from .services import analyze_with_gemini, chat_with_gemini
from .utils import MOCK_SAMPLES, get_sample_by_id
import base64
import io
from PIL import Image

main = Blueprint('main', __name__)

@main.route('/', methods=['GET'])
def index():
    return jsonify({
        "message": "Welcome to the NutriAI API",
        "status": "online",
        "documentation": "https://github.com/Sayan-CtrlZ/NutriAI"
    }), 200

@main.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "nutriAI-backend"}), 200

@main.route('/samples', methods=['GET'])
def get_samples():
    """Returns list of mock products for the user to try."""
    return jsonify(MOCK_SAMPLES), 200

@main.route('/analyze', methods=['POST'])
def analyze():
    # 1. Validate Input
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.get_json()
    ingredients = data.get('ingredients')
    image_base64 = data.get('image_base64')
    history = data.get('history') # List of previous messages
    sample_id = data.get('sample_id')
    
    # Handle Sample ID Lookup
    if sample_id:
        sample = get_sample_by_id(sample_id)
        if not sample:
            return jsonify({"error": f"Sample ID '{sample_id}' not found"}), 404
        # Use ingredients from the sample
        ingredients = sample.get('ingredients')
    
    # Check if we have at least one valid input
    has_text = ingredients and isinstance(ingredients, str) and ingredients.strip()
    has_image = image_base64 and isinstance(image_base64, str) and image_base64.strip()

    if not has_text and not has_image:
        return jsonify({"error": "Provide 'ingredients', 'image_base64', or 'sample_id'"}), 400

    # 2. Call Gemini Service
    result = analyze_with_gemini(
        ingredients_text=ingredients, 
        image_base64=image_base64,
        history=history
    )

    # 3. Handle Errors
    if "error" in result:
        return jsonify(result), 500

    # 4. Success
    return jsonify(result), 200

@main.route('/chat', methods=['POST'])
def chat():
    """Endpoint for follow-up chat questions."""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
        
    data = request.get_json()
    message = data.get('message')
    history = data.get('history') # Expected format: [{"role": "user", "parts": ["text"]}]
    context = data.get('context') # Context string (e.g. analysis result)

    if not message:
        return jsonify({"error": "Message is required"}), 400
        
    # Call Chat Service
    result = chat_with_gemini(message, history, context)
    
    if "error" in result:
        return jsonify(result), 500
        
    return jsonify(result), 200
