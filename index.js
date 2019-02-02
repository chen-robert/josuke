global.__rootdir = __dirname;

const secret = process.env.DOC_SECRET || "alessia cara";

const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();
app.set("view engine", "ejs");
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
app.use(cookieParser(secret));

app.use(require(__dirname + "/src/auth.js"));
app.use("/api", require(__dirname + "/src/api.js"));
app.use(express.static("public"));

app.get("/", (req, res) => res.render("pages/index"));
app.get("/upload", (req, res) => res.render("pages/upload"));
app.get("/about", (req, res) => res.render("pages/about"));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
