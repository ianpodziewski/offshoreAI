import fitz
import os

def handler(request):
    if request.method != "POST":
        return {
            "statusCode": 405,
            "headers": {"Content-Type": "application/json"},
            "body": '{"message": "Method not allowed."}'
        }

    try:
        pdf_data = request.body
        upload_path = '/tmp/uploaded_package.pdf'
        with open(upload_path, 'wb') as f:
            f.write(pdf_data)

        doc = fitz.open(upload_path)

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
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": '{"message": "PDF split successfully."}'
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": '{"message": "Server Error: ' + str(e) + '"}'
        }