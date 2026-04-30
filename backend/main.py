# backend/main.py
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from dotenv import load_dotenv
from module.rag_engine import RAGEngine

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

rag = RAGEngine()
conversation_histories: Dict[str, List] = {}

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

@app.get("/")
def root():
    return {"status": "Haya backend is running"}

@app.post("/chat")
async def chat(req: ChatRequest):
    if req.session_id not in conversation_histories:
        conversation_histories[req.session_id] = []
    
    history = conversation_histories[req.session_id]
    result = rag.query(req.message, history)
    
    history.append({"role": "user", "content": req.message})
    history.append({"role": "assistant", "content": result["answer"]})
    
    # Keep only last 10 exchanges
    if len(history) > 20:
        conversation_histories[req.session_id] = history[-20:]
    
    return {
        "response": result["answer"],
        "sources": result["sources"],
        "confidence": result["confidence"]
    }

@app.delete("/chat/{session_id}")
async def clear_history(session_id: str):
    conversation_histories.pop(session_id, None)
    return {"status": "cleared"}