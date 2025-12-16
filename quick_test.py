from pathlib import Path
from module.document_processor import DocumentProcessor
from module.rag_engine import RAGEngine

def quick_test():
    print("Quick Test Starting...\n")
    
    # 1. Check for PDFs
    print("Step 1: Looking for PDFs...")
    upload_dir = Path("data/uploaded")
    pdf_files = list(upload_dir.glob("*.pdf"))
    
    if not pdf_files:
        print("No PDFs found in data/uploaded/")
        print("Please add some PDF files there first.")
        return
    
    print(f"Found {len(pdf_files)} PDF(s):")
    for pdf in pdf_files:
        print(f"   - {pdf.name}")
    
    # 2. Process PDFs
    print("\nStep 2: Processing documents...")
    processor = DocumentProcessor()
    
    for pdf_path in pdf_files:
        print(f"   Processing {pdf_path.name}...")
        processor.process_document(str(pdf_path))
    
    print("All documents processed!")
    
    # 3. Ask a test question
    print("\nStep 3: Testing question answering...")
    rag = RAGEngine()
    
    # Test question in Armenian
    question = "Ի՞նչ է հավանականություն"
    print(f"   Question: {question}")
    
    result = rag.query(question)
    
    print("\n" + "="*60)
    print("ANSWER:")
    print("="*60)
    print(result['answer'])
    print("="*60)
    print(f"\nSources: {', '.join(result['sources'])}")
    print(f"Confidence: {result['confidence']*100:.1f}%")
    
    print("\nTest complete!")
    print("\nTo ask more questions, run: python test_terminal.py")

if __name__ == "__main__":
    quick_test()