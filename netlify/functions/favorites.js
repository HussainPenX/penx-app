// netlify/functions/favorites.js
let client;

async function connectDB() {
  if (!client) {
    await client.connect();
  }
  return client.db("penx-app");
}

exports.handler = async (event) => {
  try {
    const email = event.queryStringParameters.email;
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Email required" }) };
    }

    const db = await connectDB();
    const user = await db.collection("favorites").findOne({ email });

    return {
      statusCode: 200,
      body: JSON.stringify({ favorites: user?.favorites || [] }),
    };
  } catch (err) {
    console.error("Error in favorites:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};
