import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

print(f"API Key present: {bool(api_key)}")
print(f"Model: {model_name}")

if api_key:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hello, are you working?")
        print("Response from Gemini:")
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")
else:
    print("GEMINI_API_KEY not found in .env")
