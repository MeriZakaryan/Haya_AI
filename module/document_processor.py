# module/document_processor.py
import os
import json
import fitz  # PyMuPDF - better than PyPDF2
from pathlib import Path
from typing import List, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter

class DocumentProcessor:
    def __init__(self):
        self.processed_dir = Path("data/processed")
        self.processed_dir.mkdir(parents=True, exist_ok=True)

    def extract_text_from_pdf(self, pdf_path: str, max_pages: int = 50) -> str:
        """Extract text using PyMuPDF (handles Armenian, English, French)"""
        text_parts = []

        try:
            doc = fitz.open(pdf_path)
            total = min(len(doc), max_pages)

            for i in range(total):
                page_text = doc[i].get_text("text")
                if page_text.strip():
                    text_parts.append(page_text)

            doc.close()
            print(f"Extracted text from {total} pages")

        except Exception as e:
            print(f"Extraction error: {e}")

        return "\n".join(text_parts)

    def chunk_text(self, text: str) -> List[Dict]:
        """Split text into overlapping chunks for vector store"""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,        # smaller = less memory per chunk
            chunk_overlap=150,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        chunks = splitter.split_text(text)
        return [
            {"text": chunk, "chunk_id": i, "chunk_count": len(chunks)}
            for i, chunk in enumerate(chunks)
        ]

    def process_document(self, pdf_path: str, rag_engine=None) -> bool:
        """
        Process a PDF and add it to the vector store.
        Pass rag_engine from outside to avoid reloading the model.
        """
        try:
            print(f"\nProcessing: {pdf_path}")
            text = self.extract_text_from_pdf(pdf_path)

            if not text.strip():
                print("No text extracted — skipping")
                return False

            chunks = self.chunk_text(text)
            print(f"Created {len(chunks)} chunks")

            # Save processed text
            filename = Path(pdf_path).stem
            output_path = self.processed_dir / f"{filename}_processed.json"
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump({
                    "source": pdf_path,
                    "chunks": chunks,
                    "total_length": len(text)
                }, f, ensure_ascii=False, indent=2)

            # Add to vector store using passed-in engine
            if rag_engine:
                rag_engine.add_documents(chunks, source=filename)
            else:
                # Only import here if no engine passed in
                from module.rag_engine import RAGEngine
                rag = RAGEngine()
                rag.add_documents(chunks, source=filename)

            print(f"✓ Done: {filename}")
            return True

        except Exception as e:
            print(f"✗ Failed: {e}")
            return False