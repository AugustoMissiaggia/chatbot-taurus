import json 
from pandasai.llm.base import LLM
import requests
import os
import unicodedata


import pandas as pd


def normalize_str(s):
    return unicodedata.normalize("NFKD", s).encode("ASCII", "ignore").decode("utf-8")

class GeminiLLM(LLM):
    def __init__(self, api_key=None):
        self.api_key = f"AIzaSyCziSyiBsxRmEnXKWSW-nkYOtXC-sbkK8c"
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"

    def call(self, instruction, context=None):
        prompt = instruction
        if context:
            prompt = f"{context}\n\n{instruction}"

        response = requests.post(
            self.api_url,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}]
            }
        )
        try:
            raw_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            cleaned_text = normalize_str(raw_text)  
            return cleaned_text
        except Exception as e:
            print("Erro na resposta da Gemini:", response.text)
            raise Exception("Erro ao obter resposta da Gemini")

    @property
    def type(self):
        return "gemini"
