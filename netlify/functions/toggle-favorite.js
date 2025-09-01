// netlify/functions/toggle-favorite.js
const { MongoClient } = require("mongodb");
let client;

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
  }
  return client.db("penx-app");
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { email, bookId, isFavorited } = JSON.parse(event.body);
    if (!email || !bookId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
    }

    const db = await connectDB();
    const collection = db.collection("favorites");

    if (isFavorited) {
      await collection.updateOne(
        { email },
        { $addToSet: { favorites: bookId } },
        { upsert: true }
      );
    } else {
      await collection.updateOne(
        { email },
        { $pull: { favorites: bookId } }
      );
    }

    const updated = await collection.findOne({ email });

    return {
      statusCode: 200,
      body: JSON.stringify({ favorites: updated.favorites || [] }),
    };
  } catch (err) {
    console.error("Error in toggle-favorite:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};
