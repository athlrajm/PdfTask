import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import './HomePage.css'

const Extractp = () => {
  const [pdfFileData, setPdfFileData] = useState();
  const [fileList, setFileList] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);

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
      const newpdf = await pdfNewDoc.save();
      return newpdf;
    } catch (error) {
      console.error('Error loading or processing PDF:', error);
      throw error;
    }
  }

  const onFileSelected = async (e) => {
    const fileList = e.target.files;
    setFileList(e.target.files);
    setSelectedPages([]);
  };

  const onPageCheckboxChange = (page) => {
    const updatedSelectedPages = [...selectedPages];
  
    const pageIndex = page - 1; // Adjust for zero-based indexing
  
    if (updatedSelectedPages.includes(pageIndex)) {
      updatedSelectedPages.splice(updatedSelectedPages.indexOf(pageIndex), 1);
    } else {
      updatedSelectedPages.push(pageIndex);
    }
  
    setSelectedPages(updatedSelectedPages);
  }
  

  const onCreate = async () => {
    if (fileList?.length > 0) {
      const pdfArrayBuffer = await readFileAsync(fileList[0]);
      const newPdfDoc = await extractPdfPage(pdfArrayBuffer, selectedPages);
      renderPdf(newPdfDoc);
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
        {[1, 2, 3, 4, 5].map((page) => (
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
      <button onClick={onCreate} className='btn btn-primary'>Extract</button>
      {pdfFileData && (
        <embed src={pdfFileData} type="application/pdf" width="100%" height="600px" />
      )}
    </div>
  );
};

export default Extractp;
