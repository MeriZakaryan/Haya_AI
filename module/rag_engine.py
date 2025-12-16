# module/rag_engine.py
import os
import json
from pathlib import Path
from typing import List, Dict, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import ollama

class RAGEngine:
    def __init__(self):
        self.vector_store_path = Path("data/vector_store")
        self.vector_store_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize embedding model (multilingual support for Armenian)
        print("Loading embedding model...")
        self.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        self.embedding_dim = 384
        
        # Initialize FAISS index
        self.index = None
        self.documents = []
        self.load_or_create_index()
        
        # Ollama configuration
        self.model_name = "qwen2.5:latest"
        
    def load_or_create_index(self):
        """Load existing index or create new one"""
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
        """Save index and documents"""
        faiss.write_index(self.index, str(self.vector_store_path / "faiss.index"))
        with open(self.vector_store_path / "documents.json", 'w', encoding='utf-8') as f:
            json.dump(self.documents, f, ensure_ascii=False, indent=2)
    
    def add_documents(self, chunks: List[Dict], source: str):
        """Add document chunks to vector store"""
        texts = [chunk["text"] for chunk in chunks]
        
        # Generate embeddings
        print(f"Generating embeddings for {len(texts)} chunks...")
        embeddings = self.embedding_model.encode(texts, show_progress_bar=True)
        
        # Add to FAISS index
        self.index.add(embeddings.astype('float32'))
        
        # Store document metadata
        for i, chunk in enumerate(chunks):
            self.documents.append({
                "text": chunk["text"],
                "source": source,
                "chunk_id": chunk["chunk_id"]
            })
        
        self.save_index()
        print(f"Added {len(chunks)} chunks from {source}")
    
    def retrieve(self, query: str, k: int = 3) -> List[Dict]:
        """Retrieve relevant documents"""
        if len(self.documents) == 0:
            return []
        
        # Generate query embedding
        query_embedding = self.embedding_model.encode([query])
        
        # Search in FAISS
        distances, indices = self.index.search(query_embedding.astype('float32'), min(k, len(self.documents)))
        
        # Get relevant documents
        results = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx < len(self.documents):
                doc = self.documents[idx].copy()
                doc['score'] = float(1 / (1 + distance))  # Convert distance to similarity
                results.append(doc)
        
        return results
    
    def generate_answer(self, query: str, context: str, conversation_history: List[Dict]) -> str:
        """Generate answer using Ollama"""
        
        # Build conversation messages
        messages = []
        
        # System prompt
        system_prompt = """Դու ՀայԱՏ-ի խելացի ուսումնական օգնականն ես, որը մասնագիտացած է հավանականությունների տեսության մեջ։
        
Քո խնդիրն է օգնել ուսանողներին խորը ըմբռնել հասկացությունները, այլ ոչ թե պարզապես տրամադրել պատասխաններ քննությանը պատրաստվելու համար։

You are HayaAI's intelligent learning assistant, specialized in Probability Theory.

Your task is to help students deeply understand concepts, not just provide answers for exam preparation.

Սկզբունքներ / Principles:
1. Խրախուսել քննադատական մտածողություն / Encourage critical thinking
2. Տրամադրել քայլ առ քայլ բացատրություններ / Provide step-by-step explanations  
3. Օգտագործել օրինակներ և անալոգիաներ / Use examples and analogies
4. Կապել տեսությունը փորձի հետ / Connect theory with practice
5. Հարցեր տալ հասկանալիություն ստուգելու համար / Ask questions to check understanding

Միշտ պատասխանիր ուսանողի նախընտրած լեզվով (հայերեն կամ անգլերեն)։
Always respond in the student's preferred language (Armenian or English)."""

        messages.append({"role": "system", "content": system_prompt})
        
        # Add conversation history
        for msg in conversation_history[-4:]:  # Last 4 exchanges
            messages.append(msg)
        
        # Add current query with context
        user_message = f"""Հարց: {query}

Համատեքստ տվյալների բազայից:
{context}

Խնդրում եմ տրամադրել մանրամասն և կրթական պատասխան, որը կօգնի ուսանողին իսկապես հասկանալ թեման։"""
        
        messages.append({"role": "user", "content": user_message})
        
        try:
            # Call Ollama
            response = ollama.chat(
                model=self.model_name,
                messages=messages,
                options={
                    "temperature": 0.7,
                    "top_p": 0.9,
                }
            )
            
            return response['message']['content']
            
        except Exception as e:
            print(f"Ollama error: {e}")
            return f"Ներողություն, սխալ տեղի ունեցավ AI-ի հետ կապվելիս։ / Sorry, an error occurred while connecting to the AI: {str(e)}"
    
    def query(self, question: str, conversation_history: Optional[List[Dict]] = None) -> Dict:
        """Main query pipeline"""
        if conversation_history is None:
            conversation_history = []
        
        # Retrieve relevant documents
        relevant_docs = self.retrieve(question, k=3)
        
        if not relevant_docs:
            return {
                "answer": "Ներողություն, տվյալների բազայում համապատասխան տեղեկատվություն չի գտնվել։ Խնդրում եմ վերբեռնել փաստաթղթեր։\n\nSorry, no relevant information found in the database. Please upload documents first.",
                "sources": [],
                "confidence": 0.0
            }
        
        # Build context
        context = "\n\n".join([
            f"[Աղբյուր {i+1} / Source {i+1}: {doc['source']}]\n{doc['text']}"
            for i, doc in enumerate(relevant_docs)
        ])
        
        # Generate answer
        answer = self.generate_answer(question, context, conversation_history)
        
        # Calculate confidence
        avg_score = np.mean([doc['score'] for doc in relevant_docs])
        
        return {
            "answer": answer,
            "sources": list(set([doc['source'] for doc in relevant_docs])),
            "confidence": float(avg_score)
        }
    
    def reset_vector_store(self):
        """Reset the vector store"""
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        self.documents = []
        self.save_index()
        print("Vector store reset successfully")