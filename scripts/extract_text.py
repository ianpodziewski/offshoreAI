import pdfplumber
import json

SAMPLE_PDF_PATH = "data/your_sample_loan_package.pdf"

def extract_text_from_pdf(pdf_path):
    sample_data = {}
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                sample_data[f"page_{i+1}"] = text
    return sample_data

sample_dataset = extract_text_from_pdf(SAMPLE_PDF_PATH)

with open("data/sample_dataset.json", "w") as f:
    json.dump(sample_dataset, f, indent=4)

print("✅ Sample dataset created successfully!")
