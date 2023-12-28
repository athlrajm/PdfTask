import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PdfComp from './PdfComp';
import { pdfjs } from 'react-pdf';
import './HomePage.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const HomePage = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [allImage, setAllImage] = useState([]);
  const [PdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [downloadLink, setDownloadLink] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);

  useEffect(() => {
    getPdf();
  }, []);

  const getPdf = async () => {
    try {
      const result = await axios.get('http://localhost:5000/get-files');
      setAllImage(result.data.data);
      
      setNumPages(0);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    }
  };

  const submitImage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      const result = await axios.post('http://localhost:5000/pdfs/pdfs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (result.data.status === 'ok') {
        alert('Uploaded Successfully!!!');
        getPdf();
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  };

  const showPdf = async (PdfFile) => {
    setPdfFile(`http://localhost:5000/files/${PdfFile}`);
    setDownloadLink(null);
  
    try {
      
      const response = await fetch(`http://localhost:5000/files/${PdfFile}`);
      const buffer = await response.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument(new Uint8Array(buffer)).promise;
      setNumPages(pdf.numPages);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  
    
    setSelectedPages([]);
  };

  const handlePageSelection = (page) => {
    setSelectedPages((prevSelectedPages) => {
      const index = prevSelectedPages.indexOf(page);
      if (index === -1) {
        return [...prevSelectedPages, page];
      } else {
        return prevSelectedPages.filter((selectedPage) => selectedPage !== page);
      }
    });
  };

  const extractPages = async () => {
    try {
      const result = await axios.post('http://localhost:5000/extract-pages', {
        pdfId: PdfFile.split('/').pop(), 
        selectedPages,
      });
  
      if (result.data.status === 'ok') {
        alert('Pages extracted successfully!');
        setDownloadLink(result.data.outputPath);
  
       
        const updatedPdfFile = `http://localhost:5000/files/${result.data.outputPath}`;
        setPdfFile(updatedPdfFile);
      }
    } catch (error) {
      console.error('Error extracting pages:', error);
    }
  };

  return (
    <div className='home'>
      <form method='post' onSubmit={submitImage} className='form1'>
        <div className='row'>
        <label className='label1'>Title</label>
        <br />
        <input
          type='text'
          className='title'
          id='title'
          name='title'
          required
          onChange={(e) => setTitle(e.target.value)}
        ></input>
        </div>
        <br />
        <div className='row'>
        <label className='label1'>PDF</label>
        <br />
        <input
          type='file'
          className='title'
          id='pdffile'
          name='pdffile'
          accept='application/pdf'
          required
          onChange={(e) => setFile(e.target.files[0])}
        ></input>
        </div>
        <br />
        <input type='submit' value='submit'></input>
      </form>

      <div className='uploaded'>
        <h4 className='up'>Uploaded PDF"s:</h4>
        <div className='output-div'>
          {allImage.map((data) => (
            <div key={data._id} className='inner-div'>
              <h6 className='up2'>Title: {data.Title}</h6>
              <button className='btn btn-primary' onClick={() => showPdf(data.PdfFile)}>
                Show Pdf
              </button>
            </div>
          ))}
        </div>
      </div>
      {numPages > 0 && (
        <div className='extract-pages'>
          {/* <h4 className='bt2'>Select Pages to Extract:</h4>
          {Array.from({ length: numPages }, (_, index) => (
            <div key={`page-${index + 1}`}>
              <label>
                <input
                  type='checkbox'
                  value={index + 1}
                  checked={selectedPages.includes(index + 1)}
                  onChange={() => handlePageSelection(index + 1)}
                />
                Page {index + 1}
              </label>
            </div>
          ))} */}
          {/* <button onClick={extractPages}>Extract Selected Pages</button>
          {downloadLink && (
            <a href={`http://localhost:5000/files/${downloadLink}`} download={`extracted-pages_${downloadLink}.pdf`}>
              Download Extracted Pages
            </a>
          )} */}
        </div>
      )}
      

      <PdfComp PdfFile={PdfFile} />
    </div>
  );
};

export default HomePage;