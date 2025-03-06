from http.server import BaseHTTPRequestHandler
import fitz  # PyMuPDF
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        pdf_data = self.rfile.read(content_length)

        # Save temporarily
        upload_path = '/tmp/uploaded_package.pdf'
        with open(upload_path, 'wb') as f:
            f.write(pdf_data)

        # Open PDF
        doc = fitz.open(upload_path)

        # Folder for split PDFs
        split_folder = '/tmp/split_docs'
        os.makedirs(split_folder, exist_ok=True)

        # Loop and split based on content
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()

            # Identify document type
            if "Promissory Note" in text:
                doc_name = "promissory_note.pdf"
            elif "Deed of Trust" in text:
                doc_name = "deed_of_trust.pdf"
            elif "Title Policy" in text:
                doc_name = "title_policy.pdf"
            else:
                doc_name = f"page_{page_num+1}.pdf"

            new_doc = fitz.open()
            new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
            new_doc.save(os.path.join(split_folder, doc_name))

        # Respond
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = '{"message": "PDF split successfully."}'
        self.wfile.write(response.encode())
