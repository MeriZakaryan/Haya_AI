import os
import sys
from pathlib import Path
from module.document_processor import DocumentProcessor
from module.rag_engine import RAGEngine
from module.utils import check_ollama_connection

def print_header(text):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def test_prerequisites():
    """Check if all prerequisites are installed"""
    print_header("Testing Prerequisites")
    
    # Test Ollama
    print("1. Checking Ollama connection...")
    if check_ollama_connection():
        print("Ollama is running")
    else:
        print("Ollama is not running")
        print("Please start Ollama: ollama serve")
        return False
    
    # Test Tesseract
    print("2. Checking Tesseract OCR...")
    try:
        import pytesseract
        version = pytesseract.get_tesseract_version()
        print(f"Tesseract version: {version}")
        
        langs = pytesseract.get_languages()
        if 'hye' in langs:
            print("Armenian language support found")
        else:
            print("Armenian language support not found")
            print("Install with: sudo apt-get install tesseract-ocr-hye")
    except Exception as e:
        print(f"Tesseract error: {e}")
        return False
    
    # Test other imports
    print("3. Checking Python dependencies...")
    try:
        from sentence_transformers import SentenceTransformer
        import faiss
        print("All dependencies installed")
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False
    
    return True

def process_all_pdfs():
    """Process all PDFs in data/uploaded directory"""
    print_header("Processing Documents")
    
    upload_dir = Path("data/uploaded")
    if not upload_dir.exists():
        print(f"Directory {upload_dir} not found!")
        print("Creating directory...")
        upload_dir.mkdir(parents=True, exist_ok=True)
        print("Directory created. Please add PDF files there.")
        return False
    
    pdf_files = list(upload_dir.glob("*.pdf"))
    
    if not pdf_files:
        print(f"No PDF files found in {upload_dir}")
        print("Please add PDF files to data/uploaded/")
        return False
    
    print(f"Found {len(pdf_files)} PDF files:")
    for pdf in pdf_files:
        print(f"  - {pdf.name}")
    
    processor = DocumentProcessor()
    
    for i, pdf_path in enumerate(pdf_files, 1):
        print(f"\n[{i}/{len(pdf_files)}] Processing: {pdf_path.name}")
        try:
            success = processor.process_document(str(pdf_path))
            if success:
                print(f"Successfully processed {pdf_path.name}")
            else:
                print(f"Failed to process {pdf_path.name}")
        except Exception as e:
            print(f"Error processing {pdf_path.name}: {e}")
    
    return True

def interactive_qa():
    """Interactive question-answering session"""
    print_header("Interactive Q&A Session")
    print("Ask questions in Armenian or English")
    print("Commands:")
    print("  'quit' or 'exit' - Exit the session")
    print("  'reset' - Reset conversation history")
    print("  'sources' - Toggle showing sources")
    print()
    
    rag = RAGEngine()
    conversation_history = []
    show_sources = True
    
    while True:
        try:
            # Get user input
            question = input("\n ... Your question: ").strip()
            
            if not question:
                continue
            
            # Handle commands
            if question.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            if question.lower() == 'reset':
                conversation_history = []
                print("Conversation history reset")
                continue
            
            if question.lower() == 'sources':
                show_sources = not show_sources
                print(f"Sources display {'enabled' if show_sources else 'disabled'}")
                continue
            
            # Ask question
            print("\nThinking...")
            result = rag.query(question, conversation_history)
            
            # Display answer
            print("\nAnswer:")
            print("-" * 60)
            print(result['answer'])
            print("-" * 60)
            
            # Display metadata
            if show_sources and result['sources']:
                print(f"\nSources: {', '.join(result['sources'])}")
            
            if result['confidence'] > 0:
                print(f"✓ Confidence: {result['confidence']*100:.1f}%")
            
            # Update conversation history
            conversation_history.append({
                'role': 'user',
                'content': question
            })
            conversation_history.append({
                'role': 'assistant',
                'content': result['answer']
            })
            
            # Keep only last 6 messages (3 exchanges)
            if len(conversation_history) > 6:
                conversation_history = conversation_history[-6:]
        
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"\nError: {e}")
            print("Please try again or type 'quit' to exit")

def main():
    """Main function"""
    print_header("HayaAI Terminal Testing")
    print("Welcome to HayaAI - Probability Theory Assistant")
    print()
    
    # Test prerequisites
    if not test_prerequisites():
        print("\nPrerequisites check failed!")
        print("Please fix the issues above and try again.")
        return
    
    print("\nAll prerequisites are ready!")
    
    # Menu
    while True:
        print("\n" + "="*60)
        print("What would you like to do?")
        print("="*60)
        print("1. Process PDF documents")
        print("2. Ask questions (interactive mode)")
        print("3. Process PDFs and then ask questions")
        print("4. Check system status")
        print("5. Exit")
        print()
        
        choice = input("Enter your choice (1-5): ").strip()
        
        if choice == '1':
            process_all_pdfs()
        
        elif choice == '2':
            # Check if vector store exists
            vector_store_path = Path("data/vector_store/documents.json")
            if not vector_store_path.exists():
                print("\nNo documents found in vector store!")
                print("Please process PDFs first (option 1)")
                continue
            interactive_qa()
        
        elif choice == '3':
            if process_all_pdfs():
                input("\nPress Enter to continue to Q&A...")
                interactive_qa()
        
        elif choice == '4':
            test_prerequisites()
            
            # Check vector store status
            vector_store_path = Path("data/vector_store/documents.json")
            if vector_store_path.exists():
                import json
                with open(vector_store_path, 'r') as f:
                    docs = json.load(f)
                print(f"\nVector store: {len(docs)} document chunks loaded")
            else:
                print("\nVector store: Empty (no documents processed yet)")
        
        elif choice == '5' or choice.lower() == 'exit':
            print("\nThank you for using HayaAI!")
            break
        
        else:
            print("\nInvalid choice. Please enter 1-5.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nExiting... Goodbye!")
    except Exception as e:
        print(f"\nFatal error: {e}")
        import traceback
        traceback.print_exc()