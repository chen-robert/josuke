const mammoth = require("mammoth");
const pdf2html = require("pdf2html");

const docs = "docs";
const fs = require("fs");

const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const app = express();
const PORT = process.env.PORT || 4000;

const compression = require("compression");
app.use(compression());
app.use(
  fileUpload({
    createParentPath: true,
    abortOnLimit: true,
    limits: {
      fileSize: 50 * 1024 * 1024
    }
  })
);
app.use(cookieParser());

app.use(require(__dirname + "/src/auth.js"));

app.use(express.static("public"));

app.post("/upload", (req, res) => {
  const file = req.files.file;
  if (file === undefined) return;

  file.mv(
    `${__dirname}/uploads/${req.cookies.userid}/${file.md5()}_${file.name}`
  );
  res.sendStatus(200);
  
  cached[req.cookies.userid] = [];
});


const cached = {};
app.get("/data", (req, res) => {  
  if(cached[req.cookies.userid] === undefined) cached[req.cookies.userid] = [];
  
  const htmlSegments = cached[req.cookies.userid];
  if(cached[req.cookies.userid].length === 0){
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
    explore(`uploads/${req.cookies.userid}`);

    Promise.all(promises).then(() => res.send(htmlSegments.join("")));
  }else{
    res.send(htmlSegments.join(""));
  }
});

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
