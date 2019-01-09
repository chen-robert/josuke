const mammoth = require("mammoth");

const testFolder = './docs/';
const fs = require('fs');

var testStr = "";
fs.readdirSync(testFolder).forEach(file => {
  if(!file.includes(".docx"))return;
  console.log(file);
  mammoth.convertToHtml({path: `${testFolder}${file}`})
    .then(function(result){
      var html = result.value; // The generated HTML
      var messages = result.messages; // Any messages, such as warnings during conversion
      if(messages)console.log(messages);
      testStr += html;
    });
});


const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;

const compression = require("compression");
app.use(compression());

app.get("/", (req, res) => fs.readFile("style.css", "utf8", (err, css) => res.send(`<style>${css}</style>${testStr}`)));
app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
