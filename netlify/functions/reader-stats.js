// netlify/functions/reader-stats.js
const { MongoClient } = require("mongodb");
let client;

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
  }
  return client.db("penx-app"); // update DB name if needed
}

exports.handler = async (event) => {
  try {
    const email = event.queryStringParameters.email;
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Email required" }) };
    }

    const db = await connectDB();
    const user = await db.collection("readers").findOne({ email });

    return {
      statusCode: 200,
      body: JSON.stringify({ firstName: user?.firstName || "" }),
    };
  } catch (err) {
    console.error("Error in reader-stats:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};
