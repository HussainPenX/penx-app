// netlify/functions/books.js
const books = require("../../data/books.json");

exports.handler = async () => {
  try {
    const folderNames = books.map((b) => b.FolderName);
    return {
      statusCode: 200,
      body: JSON.stringify(folderNames),
    };
  } catch (err) {
    console.error("Error in books:", err);
    return { statusCode: 500, body: "Server error" };
  }
};
