// netlify/functions/books.js
const fs = require("fs");
const path = require("path");

exports.handler = async () => {
  try {
    const booksDir = path.join(__dirname, "../../public/Books");
    const folders = fs.readdirSync(booksDir).filter((f) => {
      return fs.lstatSync(path.join(booksDir, f)).isDirectory();
    });

    return {
      statusCode: 200,
      body: JSON.stringify(folders),
    };
  } catch (err) {
    console.error("Error reading books:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch books" }),
    };
  }
};
