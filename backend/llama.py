"""
Call the LLM to reply a user question
"""

from google import genai
from google.genai import types

from config import GEMINI_KEY

client = genai.Client(api_key=GEMINI_KEY)


def format_context(articles: list[dict]):
    if not articles:
        return 'No relevant article found'

    partes = []

    for a in articles:
        title = a.get('title', '?')
        chapter = a.get('chapter', '?')
        text = a.get('text', '')
        article = a.get('article')

        if article:
            header = f"[Art. {article} — {title} — {chapter}]"
        else:
            header = f"[Tit. {title} — {chapter}]"

        partes.append(f"{header}\n{text}")
    return "\n\n---\n\n".join(partes)


def call_ai(history: list, context: list[dict]):
    built_context = format_context(context)
    question = history[-1]['parts'][0]

    contents = []
    for msg in history[:-1]:
        contents.append(
            types.Content(
                role=msg['role'],
                parts=[types.Part(text=msg['parts'][0])]
            )
        )

    contents.append(
        types.Content(
            role='user',
            parts=[types.Part(
                text=(
                    f"Contexto extraído do CDC:\n\n{built_context}"
                    f"\n\nCom base apenas nesse contexto, responda: {question}"
                )
            )]
        )
    )

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=(
                "Você é um assistente jurídico especializado no Código de Defesa do Consumidor. "
                "Responda apenas com base no contexto fornecido. "
                "Sempre cite o número do artigo que fundamenta sua resposta. "
                "Se o contexto não for suficiente, diga que não encontrou essa informação no CDC."
            )
        )
    )

    return response.text
