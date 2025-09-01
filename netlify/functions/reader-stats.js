// netlify/functions/reader-stats.js
const readers = require("../../data/readers.json");

exports.handler = async (event) => {
  try {
    const email = event.queryStringParameters?.email;
    if (!email) {
      return { statusCode: 400, body: "Missing email" };
    }

    const user = readers.find((r) => r.email === email);
    return {
      statusCode: 200,
      body: JSON.stringify(user || { firstName: "Reader" }),
    };
  } catch (err) {
    console.error("Error in reader-stats:", err);
    return { statusCode: 500, body: "Server error" };
  }
};
