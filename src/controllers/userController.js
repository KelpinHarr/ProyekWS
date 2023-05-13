const db = require("../models/index");
const multer = require("multer");
const fs = require("fs");
const upload = multer({
  dest: "./uploads",
});

module.exports = {
  getAll: async function (req, res) {
    const books = await db.Book.findAll();
    return res.status(200).send(books);
  },
};
