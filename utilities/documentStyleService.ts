/**
 * Document Style Service
 * 
 * This service provides consistent styling for all document types
 * with proper watermark implementation and document centering.
 */

// Function to get watermark styles for consistent usage
export const getWatermarkStyle = (): string => {
  return `
    /* Watermark styles */
    html, body {
      position: relative;
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100vh;
      font-family: Arial, sans-serif;
    }
    body {
      display: flex;
      justify-content: center;
    }
    .watermark {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      z-index: 1000;
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
    .document-content {
      position: relative;
      z-index: 1;
      max-width: 850px;
      width: 100%;
      margin: 20px auto;
      padding: 20px;
      box-sizing: border-box;
      background-color: white;
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
    .document-container {
      background: white;
      width: 100%;
      padding: 20px 30px;
      border: 1px solid #ccc;
      border-radius: 5px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #ddd;
      padding-bottom: 10px;
      margin-top: 0;
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