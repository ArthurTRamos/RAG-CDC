"""
Main code for the backend application
"""

from fastapi import FastAPI
from pydantic import BaseModel

from embedder import text_embedder
from llama import call_ai
from vector_store import get_similar_vectors

app = FastAPI()

history = []


# Pydantic structure
class AskRequest(BaseModel):
    message: str


@app.post('/ask')
def ask_model(request: AskRequest):
    vector_query = text_embedder(request.message)

    similar_articles = get_similar_vectors(vector_query)

    history.append({
        'role': 'user',
        'parts': [request.message]
    })

    answer = call_ai(history, similar_articles)

    history.append({
        'role': 'model',
        'parts': [answer]
    })

    return {'answer': answer}
