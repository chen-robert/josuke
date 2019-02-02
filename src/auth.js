const fs = require("fs");
const uuid = require("uuid/v4");
const auth = (req, res, next) => {
  if (req.signedCookies.userid === undefined) {
    const id = uuid();
    res.cookie("userid", id, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, signed: true });
    
    fs.mkdirSync(`uploads/${id}`);
    return res.redirect("/upload");
  }
  next();
};

module.exports = auth;