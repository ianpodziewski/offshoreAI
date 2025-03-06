from http import HTTPStatus
from typing import Any
from urllib.parse import parse_qs
from PyPDF2 import PdfReader, PdfWriter
import json
import tempfile
import os

def handler(request):
    if request.method != "POST":
        return {
            "statusCode": HTTPStatus.METHOD_NOT_ALLOWED,
            "body": "Method not allowed.",
        }

    pdf_data = request.get_data()

    upload_path = '/tmp/uploaded_package.pdf'
    with open(upload_path, 'wb') as f:
        f.write(pdf_data)

    import fitz  # PyMuPDF
    doc = fitz.open(upload_path)

    split_folder = '/tmp/split_docs'
    import os
    os.makedirs(split_folder, exist_ok=True)

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text()

        if "Promissory Note" in text:
            doc_name = "promissory_note.pdf"
        elif "Deed of Trust" in text:
            doc_name = "deed_of_trust.pdf"
        else:
            doc_name = f"page_{page_num+1}.pdf"

        new_doc = fitz.open()
        new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
        new_doc.save(f"/tmp/{doc_name}")

    return {
        "statusCode": HTTPStatus.OK,
        "body": "PDF split successfully."
    }