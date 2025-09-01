exports.handler = async () => {
    try {
      // Books.json will be served as a static asset
      const res = await fetch(`${process.env.URL}/Books/books.json`);
  
      if (!res.ok) {
        throw new Error(`Failed to fetch books.json: ${res.status}`);
      }
  
      const books = await res.json();
  
      return {
        statusCode: 200,
        body: JSON.stringify(books),
      };
    } catch (err) {
      console.error("Error loading books.json:", err);
      return { statusCode: 500, body: "Server error" };
    }
  };
  