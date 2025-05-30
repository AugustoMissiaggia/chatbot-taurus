import requests
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCziSyiBsxRmEnXKWSW-nkYOtXC-sbkK8c")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

def ask_gemini(user_text: str) -> str:
    response = requests.post(
        GEMINI_URL,
        headers={"Content-Type": "application/json"},
        json={"contents": [{"parts": [{"text": user_text}]}]}
    )
    gemini_data = response.json()
    try:
        return gemini_data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise ValueError("Resposta inválida da IA.")
