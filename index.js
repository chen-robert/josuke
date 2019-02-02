const mammoth = require("mammoth");
const pdf2html = require("pdf2html");

const docs = "docs";
const fs = require("fs");

const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const uuid = require("uuid/v4");
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
app.use((req, res, next) => {
  if (req.cookies.userid === undefined) {
    res.cookie("userid", uuid(), { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true });
  }
  next();
});

app.use(express.static("public"));

app.post("/upload", (req, res) => {
  const file = req.files.file;
  if (file === undefined) return;

  file.mv(
    `${__dirname}/uploads/${req.cookies.userid}/${file.md5()}_${file.name}`
  );
  res.sendStatus(200);
});

app.get("/data", (req, res) => {
  var promises = [];
  var htmlSegments = [];
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
});

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
