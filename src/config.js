const config = {
  // Use environment variable if available, otherwise fallback to localhost
  API_URL: process.env.REACT_APP_API_URL ||  "/.netlify/functions",
  // Add other configuration variables here as needed
};

export default config; 