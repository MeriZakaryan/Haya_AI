# ingest.py — run this ONCE to load all PDFs into vector store
import os, sys
sys.path.append('.')
from module.rag_engine import RAGEngine
from module.document_processor import DocumentProcessor

def ingest_all(pdf_folder="data/uploaded"):
    if not os.path.exists(pdf_folder):
        print(f"Folder not found: {pdf_folder}")
        return

    pdfs = [f for f in os.listdir(pdf_folder) if f.endswith('.pdf')]
    if not pdfs:
        print("No PDFs found.")
        return

    print(f"Found {len(pdfs)} PDFs\n")

    # Load model ONCE, reuse for all PDFs
    rag = RAGEngine()
    dp = DocumentProcessor()

    for pdf in pdfs:
        path = os.path.join(pdf_folder, pdf)
        size_mb = os.path.getsize(path) / (1024 * 1024)
        print(f"→ {pdf} ({size_mb:.1f} MB)")
        dp.process_document(path, rag_engine=rag)  # pass engine in

    print(f"\nDone. Vector store has {len(rag.documents)} chunks total.")

if __name__ == "__main__":
    ingest_all()