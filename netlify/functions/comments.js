// netlify/functions/comments.js
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
    const db = await connectDB();
    const collection = db.collection("comments");

    if (event.httpMethod === "GET") {
      const bookId = event.queryStringParameters.bookId;
      if (!bookId) return { statusCode: 400, body: "Missing bookId" };

      const comments = await collection.find({ bookId }).toArray();
      return { statusCode: 200, body: JSON.stringify(comments) };
    }

    if (event.httpMethod === "POST") {
      const { bookId, user, text } = JSON.parse(event.body);
      if (!bookId || !user || !text) {
        return { statusCode: 400, body: "Missing fields" };
      }

      await collection.insertOne({
        bookId,
        user,
        text,
        createdAt: new Date(),
      });

      return { statusCode: 201, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err) {
    console.error("Error in comments:", err);
    return { statusCode: 500, body: "Server error" };
  }
};
