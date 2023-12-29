import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import './HomePage.css';

const Extractp = () => {
  const [pdfFileData, setPdfFileData] = useState();
  const [fileList, setFileList] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const [extractedPdfData, setExtractedPdfData] = useState(null);

  function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  function renderPdf(uint8array) {
    const tempblob = new Blob([uint8array], {
      type: 'application/pdf',
    });
    const docUrl = URL.createObjectURL(tempblob);
    setPdfFileData(docUrl);
  }

  async function extractPdfPage(arrayBuff, selectedPages) {
    try {
      const pdfSrcDoc = await PDFDocument.load(arrayBuff);

      if (!pdfSrcDoc) {
        throw new Error('PDF document is undefined.');
      }

      const pdfNewDoc = await PDFDocument.create();

      const pages = await pdfNewDoc.copyPages(pdfSrcDoc, selectedPages);
      pages.forEach((page) => pdfNewDoc.addPage(page));
      const newPdfBytes = await pdfNewDoc.save();

      setExtractedPdfData(newPdfBytes); 
      renderPdf(newPdfBytes); 
    } catch (error) {
      console.error('Error loading or processing PDF:', error);
      throw error;
    }
  }

  const onFileSelected = async (e) => {
    const fileList = e.target.files;
    setFileList(e.target.files);

    const pdfArrayBuffer = await readFileAsync(fileList[0]);
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    setNumPages(pdfDoc.getPageCount());

    setSelectedPages([]);
    setExtractedPdfData(null); 
  };

  const onPageCheckboxChange = (page) => {
    const updatedSelectedPages = [...selectedPages];

    const pageIndex = page - 1; 

    if (updatedSelectedPages.includes(pageIndex)) {
      updatedSelectedPages.splice(updatedSelectedPages.indexOf(pageIndex), 1);
    } else {
      updatedSelectedPages.push(pageIndex);
    }

    setSelectedPages(updatedSelectedPages);
  };

  const onCreate = async () => {
    if (fileList?.length > 0) {
      const pdfArrayBuffer = await readFileAsync(fileList[0]);
      await extractPdfPage(pdfArrayBuffer, selectedPages);
    }
  };

  const onDownload = () => {
    if (extractedPdfData) {
      const blob = new Blob([extractedPdfData], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'extracted.pdf';
      link.click();
    }
  };

  return (
    <div className='home'>
      <label className='label1'>Please confirm your pdf file once again:</label>
      <br></br>
      <input type="file" className='title' onChange={onFileSelected} accept="application/pdf" />
      <br></br>
      <div className='form1'>
        Select pages:
        {Array.from({ length: numPages }, (_, index) => index + 1).map((page) => (
          <label key={page}>
            <input
              type="checkbox"
              checked={selectedPages.includes(page - 1)}
              onChange={() => onPageCheckboxChange(page)}
            />
            Page {page}
          </label>
        ))}
      </div>
      <button onClick={onCreate} className='btn btn-primary'>
        Extract
      </button><br></br>
      <button onClick={onDownload} className='btn btn-secondary' disabled={!extractedPdfData}>
        Download Extracted PDF
      </button><br></br>
      {pdfFileData && (
        <embed src={pdfFileData} type="application/pdf" width="100%" height="600px" />
      )}
    </div>
  );
};

export default Extractp;