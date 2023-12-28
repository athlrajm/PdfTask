import React, { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';

function PdfComp(props) {
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    if (props.PdfFile) {
      
      fetch(props.PdfFile)
        .then((response) => response.arrayBuffer())
        .then((buffer) =>
          window.pdfjsLib.getDocument(new Uint8Array(buffer)).promise
        )
        .then((pdf) => setNumPages(pdf.numPages))
        .catch((error) => console.error('Error loading PDF:', error));
    }
  }, [props.PdfFile]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="pdf-div">
      {props.PdfFile ? (
        <>
          {numPages > 0 && (
            <p>
              Page 1 of {numPages}
            </p>
          )}
          <Document file={props.PdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from({ length: numPages }, (_, index) => (
              <Page
                key={`page-${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        </>
      ) : (
        <p>No PDF file specified.</p>
      )}
    </div>
  );
}

export default PdfComp;