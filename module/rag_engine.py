# module/rag_engine.py
import os
import json
from pathlib import Path
from typing import List, Dict, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from module.utils import truncate_context
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class RAGEngine:
    def __init__(self):
        self.vector_store_path = Path("data/vector_store")
        self.vector_store_path.mkdir(parents=True, exist_ok=True)

        print("Loading embedding model...")
        self.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        self.embedding_dim = 384

        self.index = None
        self.documents = []
        self.load_or_create_index()

        # Groq client
        self.client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        self.model_name = "llama-3.3-70b-versatile"

        self.system_prompt = """You are Haya — an intelligent AI assistant for a university management system.

You have two roles:
1. NAVIGATOR: Help users find features on the platform (courses, grades, assignments, submissions).
   Guide them step by step. Ask what they are trying to accomplish first.

2. TUTOR: Help students understand course material using the Socratic method.
   - NEVER give direct answers to academic questions.
   - Ask ONE guiding question at a time.
   - Use ONLY the provided context from course materials.
   - If the student is stuck after 2 hints, give a small nudge, not the answer.

Always respond in the student's preferred language (Armenian, English or French)."""

    def load_or_create_index(self):
        index_path = self.vector_store_path / "faiss.index"
        docs_path = self.vector_store_path / "documents.json"

        if index_path.exists() and docs_path.exists():
            print("Loading existing vector store...")
            self.index = faiss.read_index(str(index_path))
            with open(docs_path, 'r', encoding='utf-8') as f:
                self.documents = json.load(f)
            print(f"Loaded {len(self.documents)} documents")
        else:
            print("Creating new vector store...")
            self.index = faiss.IndexFlatL2(self.embedding_dim)
            self.documents = []

    def save_index(self):
        faiss.write_index(self.index, str(self.vector_store_path / "faiss.index"))
        with open(self.vector_store_path / "documents.json", 'w', encoding='utf-8') as f:
            json.dump(self.documents, f, ensure_ascii=False, indent=2)

    def add_documents(self, chunks: List[Dict], source: str):
        texts = [chunk["text"] for chunk in chunks]
        print(f"Generating embeddings for {len(texts)} chunks...")
        embeddings = self.embedding_model.encode(texts, show_progress_bar=True)
        self.index.add(embeddings.astype('float32'))
        for chunk in chunks:
            self.documents.append({
                "text": chunk["text"],
                "source": source,
                "chunk_id": chunk["chunk_id"]
            })
        self.save_index()
        print(f"Added {len(chunks)} chunks from {source}")

    def retrieve(self, query: str, k: int = 3) -> List[Dict]:
        if len(self.documents) == 0:
            return []
        query_embedding = self.embedding_model.encode([query])
        distances, indices = self.index.search(
            query_embedding.astype('float32'),
            min(k, len(self.documents))
        )
        results = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx < len(self.documents):
                doc = self.documents[idx].copy()
                doc['score'] = float(1 / (1 + distance))
                results.append(doc)
        return results

    def generate_answer(self, query: str, context: str, conversation_history: List[Dict]) -> str:
        messages = [{"role": "system", "content": self.system_prompt}]

        # Last 4 exchanges for memory
        for msg in conversation_history[-4:]:
            messages.append(msg)

        context = truncate_context(context, max_tokens=2000)
        user_message = f"""Context from course materials:
{context}

Student question: {query}"""

        messages.append({"role": "user", "content": user_message})

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Sorry, an error occurred: {str(e)}"

    def query(self, question: str, conversation_history: Optional[List[Dict]] = None) -> Dict:
        if conversation_history is None:
            conversation_history = []

        relevant_docs = self.retrieve(question, k=3)

        if not relevant_docs:
            return {
                "answer": "No relevant course material found. Please make sure documents are uploaded.",
                "sources": [],
                "confidence": 0.0
            }

        context = "\n\n".join([
            f"[Source {i+1}: {doc['source']}]\n{doc['text']}"
            for i, doc in enumerate(relevant_docs)
        ])

        answer = self.generate_answer(question, context, conversation_history)
        avg_score = np.mean([doc['score'] for doc in relevant_docs])

        return {
            "answer": answer,
            "sources": list(set([doc['source'] for doc in relevant_docs])),
            "confidence": float(avg_score)
        }

    def reset_vector_store(self):
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        self.documents = []
        self.save_index()
        print("Vector store reset")