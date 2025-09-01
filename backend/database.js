const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database connection
const db = new sqlite3.Database(path.join(__dirname, 'penx.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create authors table
    db.run(`
      CREATE TABLE IF NOT EXISTS authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        bio TEXT,
        institution INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institution) REFERENCES institutions(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating authors table:', err);
      } else {
        console.log('Authors table created or already exists');
      }
    });

    // Create institutions table
    db.run(`
      CREATE TABLE IF NOT EXISTS institutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        website TEXT,
        location TEXT NOT NULL,
        admin_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES authors(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating institutions table:', err);
      } else {
        console.log('Institutions table created or already exists');
      }
    });

    // Create books table
    db.run(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author_id INTEGER NOT NULL,
        folder_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES authors(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating books table:', err);
      } else {
        console.log('Books table created or already exists');
      }
    });

    // Create comments table
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        user_name TEXT NOT NULL,
        comment TEXT NOT NULL,
        parent_id INTEGER DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES comments(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating comments table:', err);
      } else {
        console.log('Comments table created or already exists');
      }
    });

    // Create reviews table
    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        user_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(book_id, user_email)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating reviews table:', err);
      } else {
        console.log('Reviews table created or already exists');
      }
    });

    // Add author_id to books table if it doesn't exist
    db.run(`
      ALTER TABLE books ADD COLUMN author_id INTEGER REFERENCES authors(id)
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding author_id to books table:', err);
      }
    });
  }
});

module.exports = db; 