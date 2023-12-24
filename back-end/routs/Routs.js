const express = require("express");
const Pdf=require('../Models/Pdf1')

const router = express.Router();
const multer = require("multer");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './files')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() 
    cb(null, uniqueSuffix+file.originalname)
  }
})
const upload = multer({ storage: storage });


router.post("/pdfs", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.body.title;
  const fileName = req.file.filename;
  try {
    await Pdf.create({ Title: title, PdfFile: fileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
    
  }
});

module.exports = router;