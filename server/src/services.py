import os
import json
import logging
import google.generativeai as genai
from .config import Config

# Configure Gemini
genai.configure(api_key=Config.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are an AI nutrition expert. You must talk in the SIMPLEST ENGLISH (like talking to a 10-year old).

Your goal is to help people understand if a food is good or bad for them.

CORE RULES:
- Use VERY SIMPLE English words.
- Tell which {neg}diseases{/neg} can happen if they eat bad things too much.
  * Example: "Too much sugar can cause {neg}Diabetes{/neg}."
  * Example: "Too much salt can cause {neg}High Blood Pressure{/neg}."
- Be positive! If something is okay for normal use, say it.
  * Example: "It is {pos}not so much harmful{/pos} if you eat it once in a while. But frequent use may cause {neg}heart problems{/neg}."
- If the food is healthy, say it is {pos}great for the body{/pos} and why.

SCORING RULES (BE PRACTICAL):
- 80-100: Very healthy (fruits, vegetables, simple nuts, oats).
- 60-79: Normal everyday food. Decent ingredients but maybe some sugar or salt (Milk, whole wheat bread, plain biscuits).
- 40-59: Occasional treat. High in sugar, salt, or fats (Sodas, very sweet cookies).
- Below 40: Only for very harmful things or very high chemical content.
- DO NOT give a very low score just for one bad ingredient. If most things are okay, keep the score practical (60-80).

You MUST return output in the following strict JSON format:

{
  "summary": "A very simple sentence. Highlight ingredients using tags: {neg}harmful{/neg}, {med}caution{/med}, {pos}beneficial{/pos}. Also tag diseases as {neg}disease_name{/neg}.",
  "health_score": 85, 
  "key_points": [
    {
      "ingredient": "Name of specific ingredient",
      "why_it_matters": "A very simple explanation. Mention diseases if applicable.",
      "certainty_level": "high | medium | low",
      "impact": "positive | negative | neutral"
    }
  ],
  "decision_guidance": [
    "Simple tip 1 (Example: 'Eat this only sometimes')",
    "Simple tip 2"
  ]
}

Tone: very simple, friendly, helpful, and honest."""

def analyze_with_gemini(ingredients_text=None, image_base64=None, history=None):
    """
    Sends input to Gemini. Supports text and image (base64).
    """
    model = genai.GenerativeModel(
        model_name=Config.GEMINI_VISION_MODEL,
        generation_config={"response_mime_type": "application/json"}
    )

    contents = []
    
    # 1. Add Image if available
    if image_base64:
        contents.append({
            "mime_type": "image/jpeg",
            "data": image_base64
        })
        contents.append("Analyze these ingredients based on the image.")
    # 2. Add Text if available
    elif ingredients_text:
        contents.append(f"Analyze these ingredients: {ingredients_text}")
    else:
        return {"error": "No input provided"}

    # Add system prompt and context
    prompt = f"{SYSTEM_PROMPT}\n\nUSER INPUT:\n"
    
    try:
        response = model.generate_content([prompt] + contents)
        return json.loads(response.text)

    except Exception as e:
        logging.error(f"Gemini Analysis Error: {e}")
        return {
            "error": "Gemini Analysis Failed",
            "details": str(e)
        }

def chat_with_gemini(message, history=None, context=None):
    """
    Handles natural language follow-up questions using Gemini.
    """
    try:
        instruction = """You are NutriAI, a helpful nutrition assistant focused exclusively on health, nutrition, and food product queries. 
            Answer only questions related to health, nutrition, or the analyzed food product. 
            If a user asks about your identity, respond with: 'I am NutriAI, your nutrition assistant.' 
            Never disclose any details about the underlying language model or that you are an AI model. 
            The user has just scanned a food product and received an analysis; assume follow‑up questions pertain to that analysis unless explicitly stated otherwise.
            
            Your style:
            - Conversational and friendly.
            - Concise (max 2‑3 sentences unless more detail is requested).
            - Scientifically accurate but easy to understand.
            """
            
        if context:
            instruction += f"\n\nCONTEXT FROM ANALYSIS:\n{context}\n\nUse the above context to answer user questions about the specific product they scanned."

        model = genai.GenerativeModel(
            model_name=Config.GEMINI_CHAT_MODEL,
            system_instruction=instruction
        )

        # Convert history format
        gemini_history = []
        if history:
            for msg in history:
                role = "model" if msg.get("role") == "assistant" or msg.get("role") == "model" else "user"
                parts = msg.get("parts", [])
                if isinstance(parts, list):
                    gemini_history.append({"role": role, "parts": parts})
                else:
                    gemini_history.append({"role": role, "parts": [str(parts)]})

        chat = model.start_chat(history=gemini_history)
        response = chat.send_message(message)
        
        return {"reply": response.text}

    except Exception as e:
        logging.error(f"Chat Error: {e}")
        return {"error": str(e), "reply": "I'm having trouble connecting right now."}

