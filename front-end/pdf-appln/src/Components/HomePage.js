import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PdfComp from './PdfComp';
import { pdfjs } from 'react-pdf';

import './HomePage.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
  ).toString();

const HomePage = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [allImage, setAllImage] = useState([]);
  const [PdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    getPdf();
  }, []);

  const getPdf = async () => {
    try {
      const result = await axios.get('http://localhost:5000/get-files');
      setAllImage(result.data.data);
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

  const showPdf = (PdfFile) => {
    setPdfFile(`http://localhost:5000/files/${PdfFile}`)
  };

  return (
    <div className='home'>
      <form method='post' onSubmit={submitImage}>
        <label>Title</label>
        <br />
        <input
          type='text'
          className='title'
          id='title'
          name='title'
          required
          onChange={(e) => setTitle(e.target.value)}
        ></input>
        <br />
        <label>PDF</label>
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
        <br />
        <input type='submit' value='submit'></input>
      </form>
      <div className='uploaded'>
        <h4>Uploaded PDFs:</h4>
        <div className='output-div'>
          {allImage.map((data) => (
            <div key={data._id} className='inner-div'>
              <h6>Title: {data.Title}</h6>
              <button className='btn btn-primary' onClick={() => showPdf(data.PdfFile)}>
                Show Pdf
              </button>
            </div>
          ))}
        </div>
      </div>

      <PdfComp PdfFile={PdfFile}/>
    </div>
  );
};

export default HomePage;