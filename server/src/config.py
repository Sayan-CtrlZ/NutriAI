import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration."""
    # --- HYBRID CONFIGURATION ---
    
    # 1. SCANNER (Vision) -> Uses Gemini 1.5 Flash (Reliable Vision, Free)
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    # 2. CHAT (Reasoning) -> Uses Groq Llama 3.3 (Fast, Smart)
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    # Vision Model (Required for Scan)
    GROQ_VISION_MODEL = os.getenv("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")
    # Chat Model (Required for Chat)
    GROQ_CHAT_MODEL = os.getenv("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile")

    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY is missing. Scanning will fail.")
    
    if not GROQ_API_KEY:
        print("WARNING: GROQ_API_KEY is missing. Chat will fail.")
