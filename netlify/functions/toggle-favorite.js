// netlify/functions/toggle-favorite.js
let favorites = require("../../data/favorites.json");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method not allowed" };
    }

    const { email, bookId, isFavorited } = JSON.parse(event.body);
    if (!email || !bookId) {
      return { statusCode: 400, body: "Missing email or bookId" };
    }

    // Initialize if not present
    if (!favorites[email]) {
      favorites[email] = [];
    }

    if (isFavorited) {
      if (!favorites[email].includes(bookId)) {
        favorites[email].push(bookId);
      }
    } else {
      favorites[email] = favorites[email].filter((id) => id !== bookId);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ favorites: favorites[email] }),
    };
  } catch (err) {
    console.error("Error in toggle-favorite:", err);
    return { statusCode: 500, body: "Server error" };
  }
};
