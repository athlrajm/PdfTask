const mongoose=require('mongoose')

const pdfSchema=new mongoose.Schema({
    Title:{type:String},
    PdfFile:{type:String}
},{timestamps:true})
module.exports=mongoose.model("Pdfs",pdfSchema)