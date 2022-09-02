const express = require("express")
const multer = require("multer")
const app = express()
const AdmZip = require("adm-zip");
const fs = require("fs")
const XmlConverter = require('xml-js');

const BASE_STORAGE_FOLDER = "./necessary",
    IMAGES_STORAGE_FOLDER = "./necessary/images";

if (!fs.existsSync( BASE_STORAGE_FOLDER )){
    fs.mkdirSync( BASE_STORAGE_FOLDER );
}
if (!fs.existsSync( IMAGES_STORAGE_FOLDER )){
    fs.mkdirSync( IMAGES_STORAGE_FOLDER );
}

async function readZipArchive(file) {
  try {
    const zip = new AdmZip(file);

    for (const zipEntry of zip.getEntries()) {
        if( zipEntry.entryName.endsWith(".dat") ) {
            const zip2 = new AdmZip( zipEntry.getData() )
            for (const zipEntry2 of zip2.getEntries()) {
                if( zipEntry2.entryName.endsWith("config.info") ) {
                    fs.writeFileSync(
                        `${BASE_STORAGE_FOLDER}/config.json`,
                        XmlConverter.xml2json(
                            zipEntry2.getData().toString(), 
                            {compact: true, spaces: 4}
                        )
                    )
                }
                if( zipEntry2.entryName.endsWith(".jpg") ) {
                    fs.writeFileSync(
                        `${IMAGES_STORAGE_FOLDER}/`+zipEntry2.entryName,
                        zipEntry2.getData()
                    )
                }
            }    
        }
    }
  } catch (e) {
    console.log(`Something went wrong. ${e}`);
  }
}

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

app.post('/upload', upload.single("zip_file"),(req,res) => {
    readZipArchive(req.file.buffer)
    res.send("Necessary files saved..")
})

app.listen(8080,()=>{
    console.log("Server running on port 8080");
})
