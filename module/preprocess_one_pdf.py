import fitz  # PyMuPDF
import os
import sys

def extract_text_only(pdf_path, max_pages=20):
    """
    Extract selectable text from the first N pages only.
    This avoids memory issues.
    """
    doc = fitz.open(pdf_path)
    text_parts = []

    for i, page in enumerate(doc):
        if i >= max_pages:
            break
        page_text = page.get_text("text")
        if page_text.strip():
            text_parts.append(page_text)

    doc.close()
    return "\n".join(text_parts)


def preprocess_pdf(pdf_path, output_dir="data/processed"):
    os.makedirs(output_dir, exist_ok=True)

    print(f"Preprocessing PDF: {pdf_path}")

    text = extract_text_only(pdf_path)

    output_file = os.path.join(
        output_dir,
        os.path.basename(pdf_path).replace(".pdf", ".txt")
    )

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"Saved processed text to: {output_file}")
    print(f"Text length: {len(text)} characters")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 preprocess_one_pdf.py <pdf_path>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    preprocess_pdf(pdf_path)
