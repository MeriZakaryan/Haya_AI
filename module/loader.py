import os
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import sys #this is for testing

def extract_text_from_pdf(pdf_path):
    #Extracting selectable text using PyMuPDF.
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text")
    doc.close()
    return text.strip()

def extract_images_from_pdf(pdf_path, output_dir="extracted_images"):
    os.makedirs(output_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    saved_images = []

    for page_index, page in enumerate(doc):
        images = page.get_images(full=True)

        for img_index, img in enumerate(images):
            xref = img[0]

            try:
                pix = fitz.Pixmap(doc, xref)

                # If the colorspace is unsupported or CMYK, convert to RGB
                if pix.colorspace is None or pix.n >= 5:
                    pix = fitz.Pixmap(fitz.csRGB, pix)

                img_path = os.path.join(
                    output_dir,
                    f"{os.path.basename(pdf_path)}_p{page_index}_{img_index}.png"
                )

                pix.save(img_path)
                saved_images.append(img_path)

            except Exception as e:
                print(f"⚠ Could not extract image from page {page_index}: {e}")
                continue

    doc.close()
    return saved_images


def ocr_pdf(pdf_path):
    #Extracting text from scanned PDFs using OCR.
    pages = convert_from_path(pdf_path)
    text = ""

    for i, page in enumerate(pages):
        img_path = f"tmp_ocr_page_{i}.png"
        page.save(img_path, "PNG")
        text += pytesseract.image_to_string(Image.open(img_path))

        os.remove(img_path)

    return text.strip()

def load_pdf(pdf_path):
    #Loading a PDF and return structured extracted content.
    selectable_text = extract_text_from_pdf(pdf_path)

    if len(selectable_text) < 500: 
        ocr_text = ocr_pdf(pdf_path)
    else:
        ocr_text = ""

    images = extract_images_from_pdf(pdf_path)

    return {
        "file": os.path.basename(pdf_path),
        "text": selectable_text + "\n\n" + ocr_text,
        "images": images
    }


def load_all_pdfs(data_folder="../data"):
    outputs = []
    for file in os.listdir(data_folder):
        if file.lower().endswith(".pdf"):
            path = os.path.join(data_folder, file)
            outputs.append(load_pdf(path))
    return outputs


#this is for testing
"""
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 module/loader.py <pdf_path>")
        sys.exit(1)

    pdf_path = sys.argv[1]

    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        sys.exit(1)

    print(f"...Loading PDF: {pdf_path} ...")
    result = load_pdf(pdf_path)

    print("\n Extraction complete!")
    print(f"File: {result['file']}")
    print(f"Extracted text length: {len(result['text'])} characters")
    print(f"Extracted images: {len(result['images'])}")

    # Preview the first 500 characters
    preview = result["text"][:5000].replace("\n", " ")
    print("\n--- TEXT PREVIEW ---")
    print(preview)
    print("\n--------------------")
"""
