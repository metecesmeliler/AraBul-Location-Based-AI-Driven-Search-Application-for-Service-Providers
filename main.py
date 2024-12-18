import chromadb
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class ChatRequest(BaseModel):
    message: str


class SearchResult(BaseModel):
    code: str
    description: str
    distance: float = None


class ChatResponse(BaseModel):
    results: list[SearchResult]
    original_query: str


# Initialize local ChromaDB client
client = chromadb.PersistentClient(path="./chroma_database")

# Create or get collection
collection_name = "nace_codes"
collection = client.get_or_create_collection(name=collection_name)

# Load Sentence Transformer model
model = SentenceTransformer("all-mpnet-base-v2")


# Similarity search function
def semantic_search(query, collection, model, top_k=10):
    # Generate query embedding
    query_embedding = model.encode(query).tolist()

    # Perform similarity search
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    results = semantic_search(request.message, collection, model)

    search_results = []
    for i in range(len(results['ids'][0])):
        result = SearchResult(
            code=results['ids'][0][i],
            description=results['metadatas'][0][i]['description'],
            distance=results['distances'][0][i] if 'distances' in results else None
        )
        search_results.append(result)

    return ChatResponse(
        results=search_results,
        original_query=request.message
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
