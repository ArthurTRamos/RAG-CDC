# RAG System — Brazilian Consumer Defense Code (CDC)

By Arthur Trottmann Ramos — Computer Science Student, ICMC/USP

---

## Introduction

This project is a **RAG (Retrieval-Augmented Generation)** system that allows users to query the Brazilian Consumer Defense Code (*Código de Defesa do Consumidor* — Law 8.078/1990) using natural language.

Instead of manually searching through 119 articles, users ask questions like *"Can I return a product bought online?"* and receive clear, grounded answers with exact article citations.

The pipeline was built **without abstraction frameworks like LangChain** — every step from HTML parsing to vector retrieval was implemented from scratch, ensuring full understanding and control over the system.

### Example

```
Question: "My phone stopped working after 2 months. Am I entitled to a replacement?"

Answer: Yes. According to Art. 26 of the CDC (Title I, Chapter IV), the deadline
to claim defects in durable goods is 90 days. Since a phone is a durable product
and the defect occurred within that period, you are entitled to a replacement,
repair, or full refund.

Source: Art. 26 · Art. 18 — CDC (Law 8.078/1990)
```

---

## How it works

The system is composed of two independent pipelines:

**Indexing pipeline** (runs once)
```
HTML (planalto.gov.br) → Parser → Chunks per article → Embedder → Qdrant
```

**Query pipeline** (runs on every request)
```
Question → Embedder → Vector search (Qdrant) → Context → Gemini → Answer
```

The key insight is that the LLM never relies on its own memory to answer — it only reads the retrieved articles and generates a response based on them, which eliminates hallucinations about the law.

---

## The Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI + Python 3.12 |
| Vector database | Qdrant |
| Embeddings | Google `text-embedding-001` (768 dims) |
| Generation | Gemini 3.0 Flash Preview |
| HTML parsing | BeautifulSoup4 + Regex |
| Dependency management | Poetry |
| Secondary Tools | Pytest + Ruff + Taskipy + Typos
| Frontend | React + Vite *(coming soon)* |

---

## Project Structure

```
RAG-CDC/
├── backend/
│   ├── app.py                 # FastAPI app — API endpoints
│   ├── llama.py               # Gemini integration and prompt construction
│   ├── embedder.py            # Text → vector (Google Embedding API)
│   ├── vector_store.py        # Qdrant operations (create, insert, search)
│   ├── extract_chunks.py      # HTML parser → chunks per article
│   ├── initial_ingestion.py   # Orchestrates the full indexing pipeline
│   ├── config.py              # Environment variables
│   └── pyproject.toml         # Dependencies (Poetry)
└── README.md
```

---

## How to Run

### Prerequisites

- Python 3.12+
- [Poetry](https://python-poetry.org/docs/#installation)
- [Docker](https://docs.docker.com/get-docker/)
- A free API key from [Google AI Studio](https://aistudio.google.com)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/RAG-CDC.git
cd RAG-CDC/backend
```

### 2. Install dependencies

```bash
poetry install
```

### 3. Set up environment variables

Create a `.env` file inside the `backend/` folder:

```env
CDC_URL='https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm'
GEMINI_KEY=your-api-key-here
QDRANT_HOST='localhost'
```

### 4. Start Qdrant

```bash
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -v $(pwd)/qdrant_data:/qdrant/storage \
  qdrant/qdrant
```

### 5. Index the CDC

This command fetches the CDC from the official government website, parses all 119 articles, generates embeddings, and stores them in Qdrant. Run it only once:

```bash
poetry run python ingestion_pipeline.py
```

### 6. Start the API

```bash
poetry run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs (Swagger UI) at `http://localhost:8000/docs`.

---

## API

### `POST /ask`

Receives a natural language question and returns an answer grounded in CDC articles.

**Request body:**
```json
{
  "message": "Can I return a product bought online?"
}
```

**Response:**
```json
{
  "answer": "According to Art. 49 of the CDC, the consumer has the right to withdraw from the contract within 7 calendar days from the date of signing or receipt of the product, whenever the purchase is made outside the commercial establishment — which includes online purchases."
}
```

---

## Design Decisions

**No LangChain.** Every stage of the pipeline — fetching, parsing, chunking, embedding, retrieval, and generation — was implemented manually. This ensures full visibility into what each step does and makes the system easier to debug and adapt to the legal domain.

**Chunking by article, not by token size.** Legal documents have a natural semantic structure: each article is an independent unit of meaning. Fixed-size chunking would split articles mid-sentence, mixing contexts from different legal provisions and degrading retrieval quality.

---

## Roadmap

- [ ] Frontend interface with React + Vite
- [ ] Hybrid retrieval (BM25 + semantic search)
- [ ] Quality evaluation with RAGAS
- [ ] Docker Compose setup for one-command deployment
- [ ] Support for additional Brazilian consumer laws

---

## Author

**Arthur Trottmann Ramos**
Computer Science Student — ICMC/USP (7th semester)

[![LinkedIn](https://img.shields.io/badge/arthur-trottmann-ramos)](https://linkedin.com/in/arthur-trottmann-ramos)
[![GitHub](https://img.shields.io/badge/Arthur-Ramos)](https://github.com/ArthurTRamos)
