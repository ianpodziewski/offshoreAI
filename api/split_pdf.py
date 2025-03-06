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
            
            document_keywords = {
                "Promissory Note": "promissory_note.pdf",
                "Deed of Trust": "deed_of_trust.pdf",
                "Adjustable Rate Note": "adjustable_rate_note.pdf",
                "HUD-1 Settlement Statement": "hud1_settlement_statement.pdf",
                "Home Equity Conversion Loan Agreement": "home_equity_conversion_loan_agreement.pdf",
                "Flood Insurance Certificate Notice": "flood_insurance_certificate_notice.pdf",
                "Name Affidavit": "name_affidavit.pdf",
                "Signature Affidavit": "signature_affidavit.pdf",
                "Mailing Address Affidavit": "mailing_address_affidavit.pdf",
                "Compliance Agreement": "compliance_agreement.pdf",
                "Notice of Right to Cancel": "notice_of_right_to_cancel.pdf"
                }

            # Keep track of generated filenames clearly
            saved_files = []

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text()

                doc_name = None
                for keyword, filename in document_keywords.items():
                     if keyword.lower() in text.lower():
                          doc_name = filename
                          break  # found a match clearly
                     
                if not doc_name:  # no match found
                     doc_name = f"page_{page_num+1}.pdf"
                    
                new_doc = fitz.open()
                new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
                new_doc.save(f"/tmp/{doc_name}")
                
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
