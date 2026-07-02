import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import faiss
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
load_dotenv()

from agent import generate_chat_response, AgentResponse

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SHL Conversational Assessment Recommender")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for models/data
index = None
catalog = None
embedder = None

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]

@app.on_event("startup")
def load_resources():
    global index, catalog, embedder
    
    # Load catalog
    with open("data/catalog.json", "r", encoding="utf-8") as f:
        catalog = json.loads(f.read(), strict=False)
        
    # Load FAISS index
    index = faiss.read_index("data/faiss_index.bin")
    
    # Load Embedding Model
    # Since we need to respond < 2 min on cold start, loading MiniLM takes about 2-3 seconds, which is perfectly fine.
    embedder = SentenceTransformer('all-MiniLM-L6-v2')

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/chat", response_model=AgentResponse)
def chat_endpoint(request: ChatRequest):
    try:
        # Enforce max 8 turns (16 messages total)
        if len(request.messages) > 16:
            raise HTTPException(status_code=400, detail="Conversation exceeded max 8 turns.")
            
        # Optional: Timeout handling can be implemented via async tasks or uvicorn config
        response = generate_chat_response(request.messages, index, catalog, embedder)
        return response
    except Exception as e:
        print(f"Error during /chat: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
