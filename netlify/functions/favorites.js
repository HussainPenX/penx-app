// netlify/functions/favorites.js
let favorites = require("../../data/favorites.json");

exports.handler = async (event) => {
  try {
    const email = event.queryStringParameters?.email;
    if (!email) return { statusCode: 400, body: "Missing email" };

    const userFavs = favorites[email] || [];
    return {
      statusCode: 200,
      body: JSON.stringify({ favorites: userFavs }),
    };
  } catch (err) {
    console.error("Error in favorites:", err);
    return { statusCode: 500, body: "Server error" };
  }
};
