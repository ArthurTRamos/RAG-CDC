"""
Transform a raw text into a vector based on gemini embedding model
"""

from google import genai
from google.genai import types

from config import GEMINI_KEY


def text_embedder(text: str):
    client = genai.Client(api_key=GEMINI_KEY)

    result = client.models.embed_content(
        model='gemini-embedding-001',
        contents=text,
        config=types.EmbedContentConfig(
            task_type='RETRIEVAL_DOCUMENT',
            output_dimensionality=768
        ),
    )

    return result.embeddings[0].values
