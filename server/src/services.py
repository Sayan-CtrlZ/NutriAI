import os
import json
import logging
from groq import Groq
from .config import Config

# Configure Groq
client = Groq(api_key=Config.GROQ_API_KEY)


SYSTEM_PROMPT = """You are an AI-native reasoning engine designed to help people understand food ingredients.

Your goal is to analyze the provided ingredients and summarize their overall health impact.

CORE RULES:
- Analyze what is ACTUALLY present. Do not assume or hallucinate ingredients (like sugar) if they are not listed.
- If the food is simple/healthy (e.g., "Banana"), say it is clean and nutritious.
- If there are risks, identify the top 1-2 concenrs (e.g., additives, sugar, sodium).
- Provide a single, distinct sentence summary.

You MUST return output in the following strict JSON format:

{
  "summary": "A single sentence summary. Highlight ingredients using tags: {neg}harmful{/neg}, {med}caution{/med}, {pos}beneficial{/pos}.",
  "health_score": 85, 
  "key_points": [
    {
      "ingredient": "Name of specific ingredient found",
      "why_it_matters": "Brief explanation of its effect",
      "certainty_level": "high | medium | low",
      "impact": "positive | negative | neutral"
    }
  ],
  "decision_guidance": [
    "Short tip 1",
    "Short tip 2"
  ]
}

Impact Classification Rules:
- "negative": Harmful chemicals, artificial additives with risks, high sugar, excessive sodium, trans fats.
- "positive": Whole foods, nutritious ingredients, clean sources (e.g., "Whole Wheat", "Banana", "Protein").
- "neutral": Harmless additives, water, common staples with no major benefit or harm.
- "health_score": Integer 0-100 (0=Toxic, 100=Superfood).

Text Highlighting:
- ALWAYS wrap specific ingredient names in the 'summary' text with tags based on their impact.
- Example: "This product contains {neg}High Fructose Corn Syrup{/neg} but has {pos}Whole Oats{/pos}."

Tone: objective, factual, helpful."""

def analyze_with_groq(ingredients_text=None, image_base64=None, history=None):
    """
    Sends input to Groq. Supports text and image (base64).
    """
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    user_content = []
    
    # 1. Add Image if available
    if image_base64:
        # Use Vision Model
        model_to_use = Config.GROQ_VISION_MODEL
        user_content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{image_base64}"
            }
        })
        user_content.append({
            "type": "text",
            "text": "Analyze these ingredients."
        })
    # 2. Add Text if available
    elif ingredients_text:
        model_to_use = Config.GROQ_VISION_MODEL
        user_content.append({
            "type": "text",
            "text": ingredients_text
        })
    else:
        return {"error": "No input provided"}

    messages.append({
        "role": "user",
        "content": user_content
    })

    try:
        completion = client.chat.completions.create(
            model=model_to_use,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False,
            # response_format={"type": "json_object"}, # REMOVED: Llama Guard cannot output JSON
            stop=None,
        )

        response_text = completion.choices[0].message.content
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # If model returns non-JSON (like Llama Guard returning "safe"), wrap it.
            return {
                "summary": f"Analysis complete. Model Output: {response_text}",
                "health_score": 50, # Neutral score as fallback
                "key_points": [
                    {
                        "ingredient": "Model Output",
                        "why_it_matters": response_text,
                        "certainty_level": "medium",
                        "impact": "neutral"
                    }
                ]
            }

    except Exception as e:
        logging.error(f"Groq Analysis Error: {e}")
        return {
            "error": "Groq Analysis Failed",
            "details": f"{str(e)}"
        }

def chat_with_groq(message, history=None, context=None):
    """
    Handles natural language follow-up questions using Groq.
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

        messages = [
            {"role": "system", "content": instruction}
        ]

        # Add history
        if history:
            for msg in history:
                role = "assistant" if msg.get("role") == "model" else "user"
                # history parts is a list of strings, join them
                content = " ".join(msg.get("parts", []))
                messages.append({"role": role, "content": content})

        # Add current message
        messages.append({"role": "user", "content": message})

        # Use Chat Model
        chat_model = Config.GROQ_CHAT_MODEL 

        completion = client.chat.completions.create(
            model=chat_model,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )
        
        reply = completion.choices[0].message.content
        return {"reply": reply}

    except Exception as e:
        logging.error(f"Chat Error: {e}")
        return {"error": str(e), "reply": "I'm having trouble connecting right now."}

