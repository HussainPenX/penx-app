// netlify/functions/reader-login.js
const users = [
    { email: "trial@penx.online", password: "123456" }, // demo user
  ];
  
  export async function handler(event, context) {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }
  
    const { email, password } = JSON.parse(event.body);
  
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
  
    if (user) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Login successful", email }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid email or password" }),
      };
    }
  }
  