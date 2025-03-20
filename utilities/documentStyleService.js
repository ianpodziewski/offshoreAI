"use strict";
/**
 * Document Style Service
 *
 * This service provides consistent styling for all document types
 * with proper watermark implementation and document centering.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentStyleService = exports.wrapContentWithWatermark = exports.getWatermarkStyle = void 0;
// Function to get watermark styles for consistent usage
var getWatermarkStyle = function () {
    return "\n    /* Reset and basic styling */\n    * {\n      box-sizing: border-box;\n      margin: 0;\n      padding: 0;\n    }\n    \n    html, body {\n      width: 100%;\n      height: 100%;\n      font-family: Arial, sans-serif;\n      background-color: #f5f5f5;\n    }\n    \n    body {\n      padding: 30px 20px 60px;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n    }\n    \n    /* Watermark styling */\n    .watermark {\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      pointer-events: none;\n      z-index: 1000;\n      overflow: hidden;\n    }\n    \n    .watermark:after {\n      content: \"SAMPLE\";\n      font-size: 120px;\n      color: rgba(220, 53, 69, 0.3);\n      transform: rotate(-45deg);\n      white-space: nowrap;\n      text-transform: uppercase;\n      font-weight: bold;\n      letter-spacing: 10px;\n    }\n    \n    /* Page title styling */\n    .page-title {\n      width: 100%;\n      text-align: left;\n      margin-bottom: 20px;\n      color: #555;\n      font-size: 16px;\n      max-width: 850px;\n      font-family: monospace;\n    }\n    \n    /* Document content styling */\n    .document-content {\n      position: relative;\n      background-color: white;\n      max-width: 850px;\n      width: 100%;\n      padding: 30px;\n      margin: 0 auto 60px;\n      z-index: 2;\n      border: 1px solid #ddd;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n    }\n  ";
};
exports.getWatermarkStyle = getWatermarkStyle;
// Function to wrap content in a standard document template with watermark
var wrapContentWithWatermark = function (title, content, customCss) {
    if (customCss === void 0) { customCss = ''; }
    // Extract file name from title to display at the top
    var fileTitle = title.includes('SAMPLE') ? 'SAMPLE_' + title.split('SAMPLE - ')[1].toLowerCase().replace(/ /g, '_') + '.html' : title.toLowerCase().replace(/ /g, '_') + '.html';
    return "\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>".concat(title, "</title>\n  <style>\n    ").concat((0, exports.getWatermarkStyle)(), "\n    \n    /* Document specific styles */\n    .document-container {\n      width: 100%;\n      padding: 0;\n      margin: 0;\n    }\n    \n    h1 {\n      color: #333;\n      border-bottom: 2px solid #ddd;\n      padding-bottom: 10px;\n      margin-top: 0;\n      margin-bottom: 20px;\n      text-align: center;\n    }\n    \n    .warning {\n      background-color: #fff8e1;\n      border-left: 4px solid #ffc107;\n      padding: 12px 20px;\n      margin: 20px 0;\n    }\n    \n    .info {\n      background-color: #e1f5fe;\n      border-left: 4px solid #03a9f4;\n      padding: 12px 20px;\n      margin: 20px 0;\n    }\n    \n    table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 20px;\n    }\n    \n    table, th, td {\n      border: 1px solid #ddd;\n    }\n    \n    th, td {\n      padding: 8px;\n      text-align: left;\n    }\n    \n    th {\n      background-color: #f2f2f2;\n      font-weight: bold;\n    }\n    \n    /* Section styling */\n    .header {\n      text-align: center;\n      margin-bottom: 30px;\n    }\n    \n    .application-info {\n      margin-bottom: 20px;\n      font-size: 14px;\n      text-align: center;\n      color: #555;\n      line-height: 1.5;\n    }\n    \n    .section {\n      margin-bottom: 30px;\n      border: 1px solid #ddd;\n      padding: 15px;\n      border-radius: 5px;\n      background-color: #f9f9f9;\n    }\n    \n    .section h2 {\n      margin-top: 0;\n      color: #333;\n      border-bottom: 1px solid #ddd;\n      padding-bottom: 10px;\n      margin-bottom: 15px;\n      font-size: 18px;\n    }\n    \n    /* Table improvements */\n    .section table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 0;\n    }\n    \n    .section table tr:nth-child(even) {\n      background-color: #f0f0f0;\n    }\n    \n    .section table tr:hover {\n      background-color: #e9e9e9;\n    }\n    \n    /* Custom CSS */\n    ").concat(customCss, "\n  </style>\n</head>\n<body>\n  <div class=\"page-title\">").concat(fileTitle, "</div>\n  <div class=\"document-content\">\n    ").concat(content, "\n  </div>\n  <div class=\"watermark\"></div>\n</body>\n</html>");
};
exports.wrapContentWithWatermark = wrapContentWithWatermark;
// Export the document style service functions
exports.documentStyleService = {
    getWatermarkStyle: exports.getWatermarkStyle,
    wrapContentWithWatermark: exports.wrapContentWithWatermark
};
