const fs = require("fs");
const uuid = require("uuid/v4");
const auth = (req, res, next) => {
  if (req.cookies.userid === undefined) {
    const id = uuid();
    res.cookie("userid", id, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true });
    
    fs.mkdirSync(`uploads/${id}`);
  }
  next();
};

module.exports = auth;