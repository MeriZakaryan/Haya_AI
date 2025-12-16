import os
import json
from pathlib import Path
from typing import List, Dict
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

class DocumentProcessor:
    def __init__(self):
        self.processed_dir = Path("data/processed")
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        
        # Configure Tesseract for Armenian and English
        self.tesseract_config = '--oem 3 --psm 6 -l hye+eng'
        
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF using PyPDF2 first, then OCR if needed"""
        text = ""
        
        try:
            # Try native text extraction first
            with open(pdf_path, 'rb') as file:
                pdf_reader = PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text.strip():
                        text += page_text + "\n"
            
            # If text extraction yielded little content, use OCR
            if len(text.strip()) < 100:
                print(f"Low text content detected, using OCR for {pdf_path}")
                text = self.extract_text_with_ocr(pdf_path)
                
        except Exception as e:
            print(f"Error in text extraction, falling back to OCR: {e}")
            text = self.extract_text_with_ocr(pdf_path)
        
        return text
    
    def extract_text_with_ocr(self, pdf_path: str) -> str:
        """Extract text using OCR for scanned documents"""
        text = ""
        
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path, dpi=300)
            
            # Process each page
            for i, image in enumerate(images):
                print(f"Processing page {i+1}/{len(images)} with OCR")
                
                # Preprocess image for better OCR
                image = self.preprocess_image(image)
                
                # Extract text with Tesseract (Armenian + English)
                page_text = pytesseract.image_to_string(
                    image,
                    config=self.tesseract_config
                )
                text += page_text + "\n"
                
        except Exception as e:
            print(f"OCR error: {e}")
            
        return text
    
    def preprocess_image(self, image: Image) -> Image:
        """Preprocess image for better OCR results"""
        # Convert to grayscale
        image = image.convert('L')
        
        # Increase contrast
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)
        
        return image
    
    def chunk_text(self, text: str) -> List[Dict[str, str]]:
        """Split text into chunks for vector store"""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        chunks = text_splitter.split_text(text)
        
        # Create metadata for each chunk
        chunk_docs = []
        for i, chunk in enumerate(chunks):
            chunk_docs.append({
                "text": chunk,
                "chunk_id": i,
                "chunk_count": len(chunks)
            })
        
        return chunk_docs
    
    def process_document(self, pdf_path: str) -> bool:
        """Main processing pipeline"""
        try:
            print(f"Processing document: {pdf_path}")
            
            # Extract text
            text = self.extract_text_from_pdf(pdf_path)
            
            if not text.strip():
                print("No text extracted from document")
                return False
            
            # Chunk text
            chunks = self.chunk_text(text)
            print(f"Created {len(chunks)} chunks")
            
            # Save processed data
            filename = Path(pdf_path).stem
            output_path = self.processed_dir / f"{filename}_processed.json"
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump({
                    "source": pdf_path,
                    "chunks": chunks,
                    "total_length": len(text)
                }, f, ensure_ascii=False, indent=2)
            
            # Add to vector store
            from module.rag_engine import RAGEngine
            rag = RAGEngine()
            rag.add_documents(chunks, source=filename)
            
            print(f"Successfully processed {filename}")
            return True
            
        except Exception as e:
            print(f"Error processing document: {e}")
            return False