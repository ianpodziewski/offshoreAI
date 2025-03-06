import fitz
import json
import os
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            pdf_data = self.rfile.read(content_length)

            upload_path = '/tmp/uploaded_package.pdf'
            with open(upload_path, 'wb') as f:
                f.write(pdf_data)

            doc = fitz.open(upload_path)

            split_folder = '/tmp/split_docs'
            os.makedirs(split_folder, exist_ok=True)

            # Keep track of generated filenames clearly
            saved_files = []

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
                
                # Collect each document name clearly
                saved_files.append(doc_name)

            # Return filenames clearly in response
            response = {
                'message': 'PDF split successfully.',
                'files': saved_files
            }
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            response = {'message': f'Server Error: {str(e)}'}
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
