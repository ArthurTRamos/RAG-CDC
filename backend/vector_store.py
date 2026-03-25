"""
Manage the vector Database with Qdrant
"""

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from config import QDRANT_HOST

client = QdrantClient(host=QDRANT_HOST, port=6333)


def create_collection():
    client.create_collection(
        collection_name='cdc_collection',
        vectors_config=VectorParams(size=768, distance=Distance.COSINE)
    )


def add_vector(id, vector, chunk):
    client.upsert(
        collection_name='cdc_collection',
        wait=True,
        points=[
            PointStruct(
                id=id,
                vector=vector,
                payload={
                    'text': chunk.text,
                    'article': chunk.article,
                    'chapter': chunk.chapter,
                    'title': chunk.title
                }
            )
        ],
    )


def get_similar_vectors(query_vector: list[float]):
    search_result = client.query_points(
        collection_name='cdc_collection',
        query=query_vector,
        with_payload=True,
        limit=3
    ).points

    answer = []

    for result in search_result:
        answer.append(result.payload)

    return answer
