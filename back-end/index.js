const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

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

app.get("/", (req, res) => {
  res.send("Connected to React");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});