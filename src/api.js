const fs = require("fs");
const mammoth = require("mammoth");
const pdf2html = require("pdf2html");

const express = require("express");
const router = express.Router();

router.post("/upload", (req, res) => {
  const file = req.files.file;
  const userid = req.signedCookies.userid;
  if (file === undefined) return;

  file.mv(
    `${__dirname}/uploads/${userid}/${file.md5()}_${file.name}`
  );
  res.sendStatus(200);
  
  cached[userid] = [];
});

const cached = {};
router.get("/data", (req, res) => {  
  const userid = req.signedCookies.userid;
  if(cached[userid] === undefined) cached[userid] = [];
  
  const htmlSegments = cached[userid];
  if(cached[userid].length === 0){
    const promises = [];
    const explore = folder => {
      fs.readdirSync(folder).forEach(file => {
        const fullPath = `${folder}/${file}`;

        if (fs.lstatSync(fullPath).isDirectory()) {
          explore(fullPath);
        } else {
          if (file.endsWith(".docx")) {
            promises.push(
              mammoth.convertToHtml({ path: fullPath }).then(function(result) {
                var html = result.value; // The generated HTML
                htmlSegments.push(html);
                console.log(`Loaded ${fullPath}`);
              })
            );
          } else if (file.endsWith(".pdf")) {
            pdf2html.html(`"${fullPath}"`, (err, html) => {
              if (err) return console.log(fullPath, err);
              return;
              htmlSegments.push(html);
              console.log(`Loaded ${fullPath}`);
            });
          }
        }
      });
    };
    explore(`uploads/${userid}`);

    Promise.all(promises).then(() => res.send(htmlSegments.join("")));
  }else{
    res.send(htmlSegments.join(""));
  }
});

module.exports = router;