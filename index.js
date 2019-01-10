const mammoth = require("mammoth");
const pdf2html = require('pdf2html')

const docs = 'docs';
const fs = require('fs');

var htmlSegments = [];
const explore = folder => {
  fs.readdirSync(folder).forEach(file => {
    const fullPath = `${folder}/${file}`;
    
    if(fs.lstatSync(fullPath).isDirectory()){
      explore(fullPath);
    }else{
      if(file.endsWith(".docx")){
        mammoth.convertToHtml({path: fullPath})
        .then(function(result){
          var html = result.value; // The generated HTML
          htmlSegments.push(html);
          console.log(`Loaded ${fullPath}`);
        });
      }else if(file.endsWith(".pdf")){
        pdf2html.html(`"${fullPath}"`, (err, html) => {
          if(err)return console.log(fullPath, err);
          return;
          htmlSegments.push(html);
          console.log(`Loaded ${fullPath}`);
        });
      }
    }
  });
}
explore(docs);


const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;

const compression = require("compression");
app.use(compression());

app.get("/", (req, res) => fs.readFile("style.css", "utf8", (err, css) => res.send(`<style>${css}</style>${htmlSegments.join("")}`)));
app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
