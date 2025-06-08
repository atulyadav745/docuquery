import React from 'react';

function PDFViewer({ pdf }) {
  if (!pdf || !pdf.signed_url) {
    return null;
  }

  return (
    <div className="pdf-viewer-container mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">{pdf.filename}</h5>
        <a 
          href={pdf.signed_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-sm btn-primary"
        >
          Open PDF in New Tab
        </a>
      </div>
      <div className="pdf-frame-container" style={{ height: '600px', width: '100%' }}>
        <iframe
          src={pdf.signed_url}
          title="PDF Viewer"
          width="100%"
          height="100%"
          style={{ border: '1px solid #dee2e6', borderRadius: '4px' }}
        />
      </div>
    </div>
  );
}

export default PDFViewer;