#!/usr/bin/env python
"""
Command-line interface for the PDF splitting functionality.
This script is called by the Node.js API route.
"""

import sys
import json
import argparse
from pathlib import Path
from split_pdf import process_pdf

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Split a PDF into multiple documents')
    parser.add_argument('--file', required=True, help='Path to the PDF file to split')
    args = parser.parse_args()
    
    # Get the file path
    file_path = args.file
    
    if not Path(file_path).exists():
        print(json.dumps({
            "success": False,
            "message": f"File not found: {file_path}"
        }))
        return 1
    
    try:
        # Process the PDF
        upload_id = Path(file_path).stem
        result_files = process_pdf(file_path, upload_id)
        
        # Output the result as JSON
        print(json.dumps({
            "success": True,
            "message": f"Successfully split into {len(result_files)} documents",
            "files": result_files
        }))
        
        return 0
    except Exception as e:
        print(json.dumps({
            "success": False,
            "message": f"Error processing PDF: {str(e)}"
        }))
        return 1

if __name__ == "__main__":
    sys.exit(main())