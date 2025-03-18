/**
 * Document Style Service
 * 
 * This service provides consistent styling for all document types
 * with proper watermark implementation and document centering.
 */

// Function to get watermark styles for consistent usage
export const getWatermarkStyle = (): string => {
  return `
    /* Reset and basic styling */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      font-family: Arial, sans-serif;
    }
    
    body {
      padding: 20px;
      display: flex;
      justify-content: center;
    }
    
    /* Watermark styling */
    .watermark {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      z-index: 1;
    }
    
    .watermark:after {
      content: "SAMPLE";
      font-size: 120px;
      color: rgba(220, 53, 69, 0.3);
      transform: rotate(-45deg);
      white-space: nowrap;
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 10px;
    }
    
    /* Document content styling */
    .document-content {
      position: relative;
      background-color: white;
      max-width: 850px;
      width: 100%;
      padding: 30px;
      margin: 0 auto;
      z-index: 2;
      border: 1px solid #ddd;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  `;
};

// Function to wrap content in a standard document template with watermark
export const wrapContentWithWatermark = (title: string, content: string, customCss: string = ''): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${getWatermarkStyle()}
    
    /* Document specific styles */
    .document-container {
      width: 100%;
      padding: 0;
      margin: 0;
    }
    
    h1 {
      color: #333;
      border-bottom: 2px solid #ddd;
      padding-bottom: 10px;
      margin-top: 0;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .warning {
      background-color: #fff8e1;
      border-left: 4px solid #ffc107;
      padding: 12px 20px;
      margin: 20px 0;
    }
    
    .info {
      background-color: #e1f5fe;
      border-left: 4px solid #03a9f4;
      padding: 12px 20px;
      margin: 20px 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    table, th, td {
      border: 1px solid #ddd;
    }
    
    th, td {
      padding: 8px;
      text-align: left;
    }
    
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    
    /* Section styling */
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .application-info {
      margin-bottom: 20px;
      font-size: 14px;
      text-align: center;
      color: #555;
      line-height: 1.5;
    }
    
    .section {
      margin-bottom: 30px;
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    
    .section h2 {
      margin-top: 0;
      color: #333;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
      margin-bottom: 15px;
      font-size: 18px;
    }
    
    /* Custom CSS */
    ${customCss}
  </style>
</head>
<body>
  <div class="watermark"></div>
  <div class="document-content">
    ${content}
  </div>
</body>
</html>`;
};

// Export the document style service functions
export const documentStyleService = {
  getWatermarkStyle,
  wrapContentWithWatermark
}; 