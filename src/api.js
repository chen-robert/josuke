const fs = require("fs");
const mammoth = require("mammoth");
const pdf2html = require("pdf2html");

const express = require("express");
const router = express.Router();


const cachedTemplate = userid => `${__rootdir}/cache/${userid}`;
router.post("/upload", (req, res) => {
  const file = req.files.file;
  const userid = req.signedCookies.userid;
  if (file === undefined) return;

  file.mv(
    `${__rootdir}/uploads/${userid}/${file.md5()}_${file.name}`
  )
  .catch(err => console.log(err));
  res.sendStatus(200);
  
  fs.unlink(cachedTemplate(userid));
});

router.get("/data", (req, res) => {  
  const userid = req.signedCookies.userid;  
  const cachedFile = cachedTemplate(userid);
  
  if(fs.existsSync(cachedFile)){
    res.sendFile(cachedFile);
  }else{
    const promises = [];
    const stream = fs.createWriteStream(cachedFile);
    
    stream.once("open", fd => {
      const explore = folder => {
        fs.readdirSync(folder).forEach(file => {
          const fullPath = `${folder}/${file}`;

          if (fs.lstatSync(fullPath).isDirectory()) {
            explore(fullPath);
          } else {
            if (file.endsWith(".docx")) {
              promises.push(
                mammoth.convertToHtml({ path: fullPath }).then(function(result) {
                  var html = result.value; 
                  console.log(`Loaded ${fullPath}`);
                  
                  stream.write(`${html}\n`);
                })
              );
            }
          }
        });
      };
      explore(`uploads/${userid}`);
      
      Promise.all(promises).then(() => {   
        stream.end();
        res.sendFile(cachedFile); 
      });
    });
  }
});

module.exports = router;