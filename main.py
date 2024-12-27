import chromadb
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
import requests

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
    query: str
    city: str

# Initialize local ChromaDB client
client = chromadb.PersistentClient(path="./chroma_database")

# Create or get collection
collection_name = "nace_codes"
collection = client.get_or_create_collection(name=collection_name)

# Load Sentence Transformer model
model = SentenceTransformer('./project_model')

# Similarity search function
def semantic_search(query, collection, model, top_k=3):
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
    print(f"Incoming request: {request}")
    # Perform semantic search to find relevant NACE codes
    try:
        results = semantic_search(request.query, collection, model)
        nace_codes = [
            {"NaceCode": code}
            for code in results["ids"][0]  # Extract NACE codes from ChromaDB results
        ]
    except Exception as e:
        print(f"Error in semantic search: {e}")
        return {"success": False, "error": "Semantic search failed."}

    # Prepare the request body to send to the external API
    external_request_body = {
        "NaceCodes": nace_codes,
        "Cities": [
            {
                "City": request.city,
                "Regions": []
            }
        ],
        "NoofResults": 3,
        "Page": 1
    }

    # External API URL
    external_api_url = "https://arabul.swhotel.tech/supplierlist/"

    try:
        # Send a POST request to the external API with the prepared body
        response = requests.post(
            external_api_url,
            json=external_request_body
        )
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the JSON response
        external_response_data = response.json()
        print(f"Response from external API: {external_response_data}")

        # Return the response to the frontend
        return {
            "success": True,
            "data": external_response_data
        }

    except requests.exceptions.RequestException as e:
        print(f"Error in external API request: {e}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
