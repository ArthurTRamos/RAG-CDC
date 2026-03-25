"""
Create the collection and insert the initial group of vectors
"""

from extract_chunks import fetch_html, parse_cdc

from config import CDB_URL
from embedder import text_embedder
from vector_store import add_vector, create_collection


def main():
    cdc_text = fetch_html(CDB_URL)
    chunks = parse_cdc(cdc_text)

    create_collection()

    for i, chunk in enumerate(chunks):
        embedding_list = text_embedder(chunk.text)
        add_vector(i, embedding_list, chunk)


if __name__ == '__main__':
    main()
