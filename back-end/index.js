const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const axios = require('axios');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

const dotenv = require('dotenv');
const Pdf=require('./Models/Pdf1')
const pdfRouter = require('./routs/Routs');


dotenv.config();
app.use(cors());
app.use('/files', express.static('files'));

mongoose.connect(process.env.MongoUrl).then(() => {
  console.log("mongoose connected");
});

app.use(express.json());

app.use('/pdfs', pdfRouter);


app.get("/get-files", async (req, res) => {
    try {
      const data = await Pdf.find({});
      res.send({ status: "ok", data: data });
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "error", message: "Internal Server Error" });
    }
  });
  app.post('/extract-pages', async (req, res) => {
    let extractedText = []; 
  
    try {
      const { pdfId, selectedPages } = req.body;
  
      
      const response = await axios.get(`http://localhost:5000/files/${pdfId}`, {
        responseType: 'arraybuffer',
      });
  
      const pdfBytes = response.data;
  
      console.log('Received PDF File:', pdfId);
      console.log('Selected Pages:', selectedPages);
  
      try {
        const data = await pdfParse(pdfBytes);
  
        if (!data.text || !data.pageText || data.pageText.length === 0) {
          console.error('Error: No text information found.');
          return res.status(500).json({ status: 'error', message: 'No text information found in the PDF' });
        }
  
        if (!Array.isArray(selectedPages) || selectedPages.some(page => isNaN(page) || page < 1 || page > data.numpages)) {
          console.error('Error: Invalid page numbers in selectedPages array.');
          return res.status(400).json({ status: 'error', message: 'Invalid page numbers in selectedPages array' });
        }
  
        extractedText = selectedPages.map((pageNumber) => {
          const pageIndex = pageNumber - 1;
  
          if (
            !data.pageText[pageIndex] ||
            typeof data.pageText[pageIndex].start === 'undefined' ||
            typeof data.pageText[pageIndex].end === 'undefined'
          ) {
            console.error('Error: Invalid character positions for page:', pageNumber);
            return '';
          }
  
          return data.text.substring(data.pageText[pageIndex].start, data.pageText[pageIndex].end);
        });
  
        if (extractedText.some(text => !text.trim())) {
          console.error('Error: Extracted text is empty.');
          return res.status(500).json({ status: 'error', message: 'Extracted text is empty' });
        }
  
        const outputPath = `extracted-pages_${Date.now()}.pdf`;
        const outputFullPath = path.join(__dirname, 'files', outputPath);
  
        fs.writeFileSync(outputFullPath, extractedText.join('\n'));
        console.log('Extracted Text:', extractedText);
  
        res.setHeader('Content-Type', 'application/pdf');
  
        res.sendFile(outputFullPath, {}, (err) => {
          if (err) {
            console.error('Error sending file:', err);
            return res.status(500).json({ status: 'error', message: 'Error sending file' });
          } else {
            console.log('File sent successfully');
            
            fs.unlinkSync(outputFullPath);
          }
        });
      } catch (parseError) {
        console.error('Error during PDF parsing:', parseError);
        return res.status(500).json({ status: 'error', message: 'PDF parsing error' });
      }
    } catch (error) {
      console.error('Error during PDF extraction:', error);
      return res.status(500).json({ status: 'error', message: 'General error' });
    }
  });

 
app.get("/", (req, res) => {
  res.send("Connected to React");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});  

