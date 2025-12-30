import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration."""
    # --- HYBRID CONFIGURATION ---
    
    # 1. SCANNER (Vision) & CHAT (Reasoning) -> Uses Gemini 1.5 Flash by default
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    # Base model name from .env
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    # Allow specific overrides, otherwise fallback to GEMINI_MODEL
    GEMINI_VISION_MODEL = os.getenv("GEMINI_VISION_MODEL", GEMINI_MODEL)
    GEMINI_CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", GEMINI_MODEL)

    # 2. CORS PREFERENCES
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

    # 3. SERVER CONFIG
    PORT = int(os.getenv("PORT", 10000))

    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY is missing. Scanning will fail.")
