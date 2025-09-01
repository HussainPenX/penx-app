const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cors = require('cors');
const csv = require('csv-parser');
const path = require('path');
const multer = require('multer');
const { encrypt, decrypt } = require('./encryption');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CSV Writer setup
const csvFilePath = 'readers_Accounts.csv';
const csvWriter = createCsvWriter({
  path: csvFilePath,
  header: [
    { id: 'firstName', title: 'First Name' },
    { id: 'lastName', title: 'Last Name' },
    { id: 'email', title: 'Email' },
    { id: 'password', title: 'Password' },
  ],
});

// Ensure CSV file exists
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'First Name,Last Name,Email,Password,ProfilePicture\n');
} else {
  const existingData = fs.readFileSync(csvFilePath, 'utf-8');
  if (!existingData.includes('ProfilePicture')) {
    const updatedData = existingData
      .split('\n')
      .map((line, index) => (index === 0 ? `${line},ProfilePicture` : line))
      .join('\n');
    fs.writeFileSync(csvFilePath, updatedData, 'utf-8');
  }
}

// Helper function to check if email exists in the CSV file
const doesEmailExist = async (email) => {
  return new Promise((resolve, reject) => {
    const emails = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        emails.push(row.Email);
      })
      .on('end', () => {
        resolve(emails.includes(email));
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Helper function to append a new record to the CSV file
const appendToCsv = (filePath, record) => {
  const csvLine = `${record.firstName},${record.lastName},${record.email},${record.password}\n`;
  fs.appendFileSync(filePath, csvLine, 'utf8');
};

// Updated signup endpoint to encrypt data before saving
app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const emailExists = await doesEmailExist(email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    const encryptedPassword = encrypt(password);
    appendToCsv(csvFilePath, { firstName, lastName, email, password: encryptedPassword });
    res.status(201).json({ message: 'Signup successful!' });
  } catch (error) {
    console.error('Error processing signup:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Correct the path to the Books directory
const booksFolderPath = path.join(__dirname, '../public/Books'); // Fix the incorrect path resolution

// Debugging log to verify the resolved path
console.log('Resolved Books Path:', booksFolderPath);

app.get('/api/author-stats', (req, res) => {
  const authorName = req.query.authorName?.trim().toLowerCase(); // Normalize author name

  if (!authorName) {
    return res.status(400).json({ error: 'Author name is required.' });
  }

  console.log('Author Name:', authorName); // Log the author name

  fs.readdir(booksFolderPath, (err, folders) => {
    if (err) {
      console.error('Error reading books folder:', err);
      return res.status(500).json({ error: 'Error reading books folder.' });
    }

    console.log('Folders in Books:', folders); // Log the folders in the Books directory

    let publications = 0;

    folders.forEach((folder) => {
      const bookJsonPath = path.join(booksFolderPath, folder, 'book.json');
      console.log('Checking file:', bookJsonPath); // Log the file being checked

      try {
        if (fs.existsSync(bookJsonPath)) {
          const bookData = JSON.parse(fs.readFileSync(bookJsonPath, 'utf-8'));
          console.log('Book Data:', bookData); // Log the book data

          if (bookData.Author?.trim().toLowerCase() === authorName) {
            publications++;
          }
        }
      } catch (fileError) {
        console.error(`Error processing file ${bookJsonPath}:`, fileError);
      }
    });

    console.log('Publications:', publications); // Log the number of publications

    const authorScore = publications * 10; // Example score calculation

    res.json({ score: authorScore, publications });
  });
});

// Updated endpoint to dynamically calculate institution data
app.get('/api/institution-data', (req, res) => {
  const institutionName = 'PenX Institution';
  const authorsMap = new Map();

  fs.readdir(booksFolderPath, (err, folders) => {
    if (err) {
      console.error('Error reading books folder:', err);
      return res.status(500).json({ error: 'Error reading books folder.' });
    }

    folders.forEach((folder) => {
      const bookJsonPath = path.join(booksFolderPath, folder, 'book.json');

      try {
        if (fs.existsSync(bookJsonPath)) {
          const bookData = JSON.parse(fs.readFileSync(bookJsonPath, 'utf-8'));
          const authorName = bookData.Author?.trim();

          if (authorName) {
            if (!authorsMap.has(authorName)) {
              const profilePicturePath = path.join(__dirname, '../public/images', `${authorName.replace(/\s+/g, '_')}_profile.png`);
              const profilePicture = fs.existsSync(profilePicturePath)
                ? `/images/${authorName.replace(/\s+/g, '_')}_profile.png`
                : '/images/default_profile.png';
              authorsMap.set(authorName, {
                name: authorName,
                score: 0,
                publications: 0,
                profilePicture,
              });
            } else {
              // Always preserve the profilePicture field
              const author = authorsMap.get(authorName);
              author.profilePicture = author.profilePicture || '/images/default_profile.png';
            }

            const author = authorsMap.get(authorName);
            author.publications += 1;
            author.score += 10; // Example score calculation
          }
        }
      } catch (fileError) {
        console.error(`Error processing file ${bookJsonPath}:`, fileError);
      }
    });

    const authors = Array.from(authorsMap.values());
    const collectiveScore = authors.reduce((total, author) => total + author.score, 0);
    const collectivePublications = authors.reduce((total, author) => total + author.publications, 0);

    res.json({
      name: institutionName,
      collectiveScore,
      collectivePublications,
      authors,
    });
  });
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profilePicturesDir = path.join(uploadsDir, 'profile-pictures');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir, { recursive: true });
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Update the storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    if (file.fieldname === 'profilePicture') {
      uploadPath = profilePicturesDir;
    } else {
      uploadPath = path.join(__dirname, '../public/Books/temp');
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a safe filename using timestamp and original extension
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const safeFilename = `${timestamp}${extension}`;
    cb(null, safeFilename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Author Authentication Middleware
const authenticateAuthor = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.authorId = decoded.authorId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Update the /api/add-book endpoint
app.post('/api/add-book', upload.fields([
  { name: 'bookCover', maxCount: 1 },
  { name: 'bookPdf', maxCount: 1 }
]), authenticateAuthor, async (req, res) => {
  try {
    const { bookTitle, authorName, language, genres, description } = req.body;
    const bookCover = req.files['bookCover']?.[0];
    const bookPdf = req.files['bookPdf']?.[0];
    const authorId = req.authorId;

    if (!bookTitle || !authorName || !bookCover || !bookPdf) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Create a new folder for the book
    const folders = fs.readdirSync(booksFolderPath, { withFileTypes: true })
      .filter((file) => file.isDirectory())
      .map((folder) => parseInt(folder.name, 10))
      .filter((num) => !isNaN(num));

    const nextFolderName = (Math.max(0, ...folders) + 1).toString();
    const newBookFolderPath = path.join(booksFolderPath, nextFolderName);

    if (!fs.existsSync(newBookFolderPath)) {
      fs.mkdirSync(newBookFolderPath, { recursive: true });
    }

    // Move files from temp directory to the new book folder
    const newCoverPath = path.join(newBookFolderPath, '1BookCover.png');
    const newPdfPath = path.join(newBookFolderPath, `${Date.now()}.pdf`);

    fs.renameSync(bookCover.path, newCoverPath);
    fs.renameSync(bookPdf.path, newPdfPath);

    // Create book.json
    const bookJsonPath = path.join(newBookFolderPath, 'book.json');
    const bookData = {
      Title: bookTitle,
      Author: authorName,
      Language: language,
      Genres: JSON.parse(genres),
      Description: description,
      Cover: `/Books/${nextFolderName}/1BookCover.png`,
      Pdf: `/Books/${nextFolderName}/${path.basename(newPdfPath)}`
    };

    fs.writeFileSync(bookJsonPath, JSON.stringify(bookData, null, 2));

    // Store book in database
    await db.run(
      'INSERT INTO books (author_id, folder_name) VALUES (?, ?)',
      [authorId, nextFolderName]
    );

    res.status(201).json({ message: 'Book added successfully!' });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book. Please try again.' });
  }
});

// Serve the Books directory as a static resource
app.use('/Books', express.static(booksFolderPath));

// Endpoint to list all folders in the Books directory
app.get('/Books', (req, res) => {
  console.log('Attempting to read Books directory:', booksFolderPath);
  fs.readdir(booksFolderPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error('Error reading Books directory:', err);
      return res.status(500).json({ error: 'Unable to fetch books.' });
    }

    const folders = files
      .filter((file) => file.isDirectory())
      .map((folder) => folder.name);

    console.log('Folders found:', folders);
    res.json(folders);
  });
});

// Endpoint to list files within a specific book folder
app.get('/Books/:bookId', (req, res) => {
  const { bookId } = req.params;
  const bookFolderPath = path.join(booksFolderPath, bookId);

  fs.readdir(bookFolderPath, (err, files) => {
    if (err) {
      console.error(`Error reading folder for bookId ${bookId}:`, err);
      return res.status(500).json({ error: 'Unable to fetch files for the book.' });
    }

    res.json(files);
  });
});

// Create favorites directory if it doesn't exist
const favoritesDir = path.join(__dirname, 'favorites');
if (!fs.existsSync(favoritesDir)) {
  fs.mkdirSync(favoritesDir);
}

// Get user's favorites
app.get('/api/favorites', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const favoritesFile = path.join(favoritesDir, `${email}.json`);
    let favorites = [];
    
    if (fs.existsSync(favoritesFile)) {
      const data = fs.readFileSync(favoritesFile, 'utf8');
      favorites = JSON.parse(data);
    }

    res.json({ favorites });
  } catch (error) {
    console.error('Error reading favorites:', error);
    res.status(500).json({ error: 'Failed to read favorites' });
  }
});

// Toggle favorite status
app.post('/api/toggle-favorite', async (req, res) => {
  const { email, bookId, isFavorited } = req.body;
  if (!email || !bookId) {
    return res.status(400).json({ error: 'Email and bookId are required' });
  }

  try {
    const favoritesFile = path.join(favoritesDir, `${email}.json`);
    let favorites = [];
    
    if (fs.existsSync(favoritesFile)) {
      const data = fs.readFileSync(favoritesFile, 'utf8');
      favorites = JSON.parse(data);
    }

    if (isFavorited) {
      if (!favorites.includes(bookId)) {
        favorites.push(bookId);
      }
    } else {
      favorites = favorites.filter(id => id !== bookId);
    }

    fs.writeFileSync(favoritesFile, JSON.stringify(favorites, null, 2));
    res.json({ success: true, favorites });
  } catch (error) {
    console.error('Error updating favorites:', error);
    res.status(500).json({ error: 'Failed to update favorites' });
  }
});

// Function to read reads data
function readReads() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'reads.json'), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Function to write reads data
function writeReads(reads) {
  fs.writeFileSync(path.join(__dirname, 'reads.json'), JSON.stringify(reads, null, 2));
}

// Endpoint to track book reads
app.post('/api/track-read', (req, res) => {
  const { email, bookId } = req.body;

  if (!email || !bookId) {
    return res.status(400).json({ error: 'Email and book ID are required.' });
  }

  const reads = readReads();

  if (!reads[email]) {
    reads[email] = {};
  }

  if (!reads[email][bookId]) {
    reads[email][bookId] = true;
    writeReads(reads);
  }

  res.json({ message: 'Read tracked successfully.' });
});

// Update the /api/book-stats endpoint to include read counts
app.get('/api/book-stats', (req, res) => {
  const { email, bookId } = req.query;

  if (!email || !bookId) {
    return res.status(400).json({ error: 'Email and book ID are required.' });
  }

  try {
    // Get favorites count
    let totalFavorites = 0;
    const favoritesDir = path.join(__dirname, 'favorites');
    if (fs.existsSync(favoritesDir)) {
      const userFiles = fs.readdirSync(favoritesDir);
      userFiles.forEach(file => {
        if (file.endsWith('.json')) {
          const favoritesData = JSON.parse(fs.readFileSync(path.join(favoritesDir, file), 'utf8'));
          if (favoritesData.includes(bookId)) {
            totalFavorites++;
          }
        }
      });
    }

    // Get reads count
    const reads = readReads();
    const totalReads = Object.keys(reads).filter(userEmail => reads[userEmail][bookId]).length;
    
    // Check if current user has read the book
    const hasRead = reads[email]?.[bookId] || false;
    
    // Check if current user has favorited the book
    const userFavoritesFile = path.join(favoritesDir, `${email}.json`);
    let isFavorited = false;
    if (fs.existsSync(userFavoritesFile)) {
      const userFavorites = JSON.parse(fs.readFileSync(userFavoritesFile, 'utf8'));
      isFavorited = userFavorites.includes(bookId);
    }

    res.json({ 
      isFavorited,
      hasRead,
      reads: totalReads,
      favorites: totalFavorites
    });
  } catch (error) {
    console.error('Error getting book stats:', error);
    res.status(500).json({ error: 'Failed to get book stats' });
  }
});

// Endpoint to log the current number of favorites for all books
app.get('/api/log-favorites', (req, res) => {
  try {
    const favoritesDir = path.join(__dirname, 'favorites');
    const favorites = {};
    
    if (fs.existsSync(favoritesDir)) {
      const userFiles = fs.readdirSync(favoritesDir);
      userFiles.forEach(file => {
        if (file.endsWith('.json')) {
          const email = file.replace('.json', '');
          favorites[email] = JSON.parse(fs.readFileSync(path.join(favoritesDir, file), 'utf8'));
        }
      });
    }
    
    console.log('Current Favorites:', favorites);
    res.json({ message: 'Favorites logged to the console.' });
  } catch (error) {
    console.error('Error logging favorites:', error);
    res.status(500).json({ error: 'Failed to log favorites' });
  }
});

// Updated login endpoint to decrypt and verify credentials
app.post('/api/reader-login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const results = [];
  fs.createReadStream(path.join(__dirname, 'readers_Accounts.csv'))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const user = results.find((row) => row.Email === email && decrypt(row.Password) === password);
      if (user) {
        res.json({
          message: 'Login successful',
          user: {
            firstName: user['First Name'],
            lastName: user['Last Name'],
            email: user.Email
          }
        });
      } else {
        res.status(401).json({ error: 'Invalid email or password.' });
      }
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(500).json({ error: 'Internal server error.' });
    });
});

// Endpoint to fetch reader stats dynamically
app.get('/api/reader-stats', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const results = [];
  fs.createReadStream(path.join(__dirname, 'readers_Accounts.csv'))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const user = results.find((row) => row.Email === email);
      if (user) {
        res.json({
          firstName: user['First Name'],
          lastName: user['Last Name'],
          email: user.Email,
          booksRead: user.BooksRead || 0,
          favoriteGenres: user.FavoriteGenres ? user.FavoriteGenres.split(',') : [],
          profilePicture: user.ProfilePicture || '/images/PenX logo 0002.png', // Default logo if no profile picture
        });
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(500).json({ error: 'Internal server error.' });
    });
});

// Endpoint to update profile picture
app.post('/api/update-profile-picture', (req, res) => {
  const { email, profilePicture } = req.body;

  if (!email || !profilePicture) {
    return res.status(400).json({ error: 'Email and profile picture are required.' });
  }

  const results = [];
  fs.createReadStream(path.join(__dirname, 'readers_Accounts.csv'))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const userIndex = results.findIndex((row) => row.Email === email);
      if (userIndex !== -1) {
        results[userIndex].ProfilePicture = profilePicture;

        const updatedCsvWriter = createCsvWriter({
          path: path.join(__dirname, 'readers_Accounts.csv'),
          header: Object.keys(results[0]).map((key) => ({ id: key, title: key })),
        });

        updatedCsvWriter
          .writeRecords(results)
          .then(() => res.json({ message: 'Profile picture updated successfully.' }))
          .catch((err) => {
            console.error('Error writing to CSV:', err);
            res.status(500).json({ error: 'Internal server error.' });
          });
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(500).json({ error: 'Internal server error.' });
    });
});

// Path to the profile pictures directory
const profilePicturesPath = path.join(__dirname, '../public/images/profile_pictures');
if (!fs.existsSync(profilePicturesPath)) {
  fs.mkdirSync(profilePicturesPath, { recursive: true });
}

const retryWriteToCsv = (writeOperation, retries = 5, delay = 100) => {
  return new Promise((resolve, reject) => {
    const attempt = (remainingRetries) => {
      writeOperation()
        .then(resolve)
        .catch((err) => {
          if (err.code === 'EBUSY' && remainingRetries > 0) {
            setTimeout(() => attempt(remainingRetries - 1), delay);
          } else {
            reject(err);
          }
        });
    };
    attempt(retries);
  });
};

// Update the /api/upload-profile-picture endpoint to use retry logic
app.post('/api/upload-profile-picture', upload.single('profilePicture'), (req, res) => {
  const { email } = req.body;
  const file = req.file;

  if (!email || !file) {
    return res.status(400).json({ error: 'Email and profile picture file are required.' });
  }

  console.log('Received file:', file);
  console.log('Saving file to:', profilePicturesPath);

  const filePath = `/images/profile_pictures/${file.filename}`;

  const results = [];
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const userIndex = results.findIndex((row) => row.Email === email);
      if (userIndex !== -1) {
        results[userIndex].ProfilePicture = filePath;

        const updatedCsvWriter = createCsvWriter({
          path: csvFilePath,
          header: Object.keys(results[0]).map((key) => ({ id: key, title: key })),
        });

        retryWriteToCsv(() => updatedCsvWriter.writeRecords(results))
          .then(() => res.json({ message: 'Profile picture uploaded successfully.', filePath }))
          .catch((err) => {
            console.error('Error writing to CSV:', err);
            res.status(500).json({ error: 'Internal server error.' });
          });
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(500).json({ error: 'Internal server error.' });
    });
});

// Endpoint to fetch signed-in user data
app.get('/api/account-data', (req, res) => {
  const { email } = req.query; // Expecting email as a query parameter

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const userData = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      if (row.Email === email) {
        userData.push(row);
      }
    })
    .on('end', () => {
      if (userData.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.json(userData[0]);
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).json({ error: 'Internal server error.' });
    });
});

// Endpoint to create necessary directories
app.post('/api/create-dirs', (req, res) => {
  const { paths } = req.body;
  
  if (!paths || !Array.isArray(paths)) {
    return res.status(400).json({ error: 'Invalid paths provided' });
  }

  try {
    paths.forEach(dirPath => {
      const fullPath = path.join(__dirname, '..', dirPath);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
    res.json({ message: 'Directories created successfully' });
  } catch (error) {
    console.error('Error creating directories:', error);
    res.status(500).json({ error: 'Failed to create directories' });
  }
});

// Author Authentication Routes
app.post('/api/author/signup', async (req, res) => {
  try {
    const { name, email, password, bio, institution } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required' 
      });
    }

    // Check if author already exists
    db.get('SELECT * FROM authors WHERE email = ?', [email], async (err, existingAuthor) => {
      if (err) {
        console.error('Database error checking existing author:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (existingAuthor) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new author
        db.run(
          'INSERT INTO authors (name, email, password, bio, institution) VALUES (?, ?, ?, ?, ?)',
          [name, email, hashedPassword, bio, institution],
          function(err) {
            if (err) {
              console.error('Error inserting new author:', err);
              return res.status(500).json({ message: 'Error creating author account' });
            }

            const authorId = this.lastID;
            const token = jwt.sign({ authorId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

            res.json({
              success: true,
              token,
              authorId
            });
          }
        );
      } catch (error) {
        console.error('Error in author signup process:', error);
        res.status(500).json({ message: 'Error creating author account' });
      }
    });
  } catch (error) {
    console.error('Author signup error:', error);
    res.status(500).json({ message: 'Error creating author account' });
  }
});

app.post('/api/author/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find author
    const author = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM authors WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!author) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, author.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ authorId: author.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      authorId: author.id
    });
  } catch (error) {
    console.error('Author login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Protected Author Routes
app.get('/api/author/:authorId/books', authenticateAuthor, async (req, res) => {
  try {
    const { authorId } = req.params;
    
    // Verify the requesting author matches the token
    if (req.authorId !== parseInt(authorId)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get all books for this author from the database
    const books = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM books WHERE author_id = ?', [authorId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // For each book, get the folder name from the book.json file
    const booksWithFolders = await Promise.all(books.map(async (book) => {
      try {
        const bookJsonPath = path.join(booksFolderPath, book.folder_name, 'book.json');
        if (fs.existsSync(bookJsonPath)) {
          const bookData = JSON.parse(fs.readFileSync(bookJsonPath, 'utf-8'));
          return {
            ...book,
            title: bookData.Title,
            author: bookData.Author,
            cover: bookData.Cover,
            language: bookData.Language,
            genres: bookData.Genres
          };
        }
      } catch (error) {
        console.error(`Error processing book ${book.folder_name}:`, error);
      }
      return book;
    }));

    res.json({ books: booksWithFolders });
  } catch (error) {
    console.error('Error fetching author books:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
});

// Get author details by ID
app.get('/api/author/:authorId', authenticateAuthor, async (req, res) => {
  try {
    const { authorId } = req.params;
    
    // Verify the requesting author matches the token
    if (req.authorId !== parseInt(authorId)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get author details
    const author = await new Promise((resolve, reject) => {
      db.get('SELECT id, name, email, bio, institution FROM authors WHERE id = ?', [authorId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // If author has an institution, fetch institution details
    if (author.institution) {
      try {
        const institution = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM institutions WHERE id = ?', [author.institution], (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        });

        if (institution) {
          author.institutionDetails = institution;
        }
      } catch (error) {
        console.error('Error fetching institution details:', error);
        // Don't fail the request if institution fetch fails
      }
    }

    res.json(author);
  } catch (error) {
    console.error('Error fetching author details:', error);
    res.status(500).json({ message: 'Error fetching author details' });
  }
});

// Institution endpoints
app.post('/api/institution', authenticateAuthor, async (req, res) => {
  try {
    const { name, description, website, location, adminId } = req.body;

    if (!name || !description || !location || !adminId) {
      return res.status(400).json({ error: 'Name, description, location, and admin ID are required.' });
    }

    // Create institution in database
    const result = await db.run(
      'INSERT INTO institutions (name, description, website, location, admin_id) VALUES (?, ?, ?, ?, ?)',
      [name, description, website, location, adminId]
    );

    const institutionId = result.lastID;

    // Create institution profile picture directory
    const institutionDir = path.join(__dirname, '../public/images/institutions', institutionId.toString());
    if (!fs.existsSync(institutionDir)) {
      fs.mkdirSync(institutionDir, { recursive: true });
    }

    res.status(201).json({
      id: institutionId,
      name,
      description,
      website,
      location,
      adminId
    });
  } catch (error) {
    console.error('Error creating institution:', error);
    res.status(500).json({ error: 'Failed to create institution.' });
  }
});

app.get('/api/institution/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const institution = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM institutions WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (!institution) {
      return res.status(404).json({ error: 'Institution not found.' });
    }

    res.json(institution);
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({ error: 'Failed to fetch institution details.' });
  }
});

// Update author endpoint
app.patch('/api/author/:authorId', upload.single('profilePicture'), async (req, res) => {
  const { authorId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Verify the requesting author matches the token
    if (parseInt(decoded.authorId) !== parseInt(authorId)) {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    // Get author details
    const author = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM authors WHERE id = ?', [authorId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    // First, check if profilePicture column exists
    const tableInfo = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(authors)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const hasProfilePictureColumn = tableInfo.some(col => col.name === 'profilePicture');

    // If profilePicture column doesn't exist, add it
    if (!hasProfilePictureColumn) {
      await new Promise((resolve, reject) => {
        db.run('ALTER TABLE authors ADD COLUMN profilePicture TEXT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Handle profile picture upload
    let profilePicturePath = author.profilePicture;
    if (req.file) {
      try {
        // Delete old profile picture if it exists
        if (author.profilePicture) {
          const oldPicturePath = path.join(__dirname, author.profilePicture);
          if (fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
          }
        }

        // Update the profile picture path
        profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
        console.log('New profile picture path:', profilePicturePath); // Debug log
      } catch (error) {
        console.error('Error handling profile picture:', error);
        return res.status(500).json({ error: 'Failed to handle profile picture' });
      }
    }

    // Update author data
    const bio = req.body.bio || author.bio;
    
    try {
      // Update the database with the new profile picture path
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE authors SET bio = ?, profilePicture = ? WHERE id = ?',
          [bio, profilePicturePath, authorId],
          (err) => {
            if (err) {
              console.error('Database update error:', err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });

      // Get updated author data
      const updatedAuthor = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM authors WHERE id = ?', [authorId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      console.log('Updated author data:', updatedAuthor); // Debug log

      // Return the updated author data with the correct profile picture path
      res.json({
        ...updatedAuthor,
        profilePicture: updatedAuthor.profilePicture || null
      });
    } catch (error) {
      console.error('Error updating author data:', error);
      return res.status(500).json({ error: 'Failed to update author data' });
    }
  } catch (error) {
    console.error('Error updating author:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Failed to update author profile' });
  }
});

// Endpoint to update book description and genres
app.post('/api/update-book', authenticateAuthor, async (req, res) => {
  try {
    const { bookId, description, genres } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required.' });
    }

    // Read the existing book.json file
    const bookJsonPath = path.join(booksFolderPath, bookId, 'book.json');
    if (!fs.existsSync(bookJsonPath)) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    const bookData = JSON.parse(fs.readFileSync(bookJsonPath, 'utf8'));

    // Update the book data
    if (description !== undefined) {
      bookData.Description = description;
    }
    if (genres !== undefined) {
      bookData.Genres = genres;
    }

    // Write the updated data back to the file
    fs.writeFileSync(bookJsonPath, JSON.stringify(bookData, null, 2));

    res.json({ message: 'Book updated successfully.', bookData });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book.' });
  }
});

// Reader profile picture update endpoint
app.post('/api/reader/update-profile', upload.single('profilePicture'), async (req, res) => {
  const { email } = req.body;
  const file = req.file;

  if (!email || !file) {
    return res.status(400).json({ error: 'Email and profile picture file are required.' });
  }

  try {
    // Read the CSV file
    const results = [];
    fs.createReadStream(path.join(__dirname, 'readers_Accounts.csv'))
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const userIndex = results.findIndex((row) => row.Email === email);
        if (userIndex === -1) {
          return res.status(404).json({ error: 'User not found.' });
        }

        // Update the profile picture path
        const profilePicturePath = `/uploads/profile-pictures/${file.filename}`;
        results[userIndex].ProfilePicture = profilePicturePath;

        // Write back to CSV
        const updatedCsvWriter = createCsvWriter({
          path: path.join(__dirname, 'readers_Accounts.csv'),
          header: Object.keys(results[0]).map((key) => ({ id: key, title: key })),
        });

        await updatedCsvWriter.writeRecords(results);
        res.json({ 
          message: 'Profile picture updated successfully.',
          profilePicture: profilePicturePath
        });
      })
      .on('error', (err) => {
        console.error('Error reading CSV file:', err);
        res.status(500).json({ error: 'Internal server error.' });
      });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Failed to update profile picture.' });
  }
});

// Admin Analytics Endpoint
app.get('/api/admin/analytics', async (req, res) => {
  try {
    // Get total readers from CSV
    const readers = [];
    fs.createReadStream(path.join(__dirname, 'readers_Accounts.csv'))
      .pipe(csv())
      .on('data', (data) => readers.push(data))
      .on('end', async () => {
        const totalReaders = readers.length;

        // Get books data
        const books = [];
        const authorsSet = new Set();
        const languageCounts = {};
        const genreCounts = {};
        const bookStats = {};

        fs.readdir(booksFolderPath, (err, folders) => {
          if (err) {
            console.error('Error reading books folder:', err);
            return res.status(500).json({ error: 'Error reading books folder.' });
          }

          folders.forEach((folder) => {
            if (folder === 'temp') return; // Skip temp folder
            
            const bookJsonPath = path.join(booksFolderPath, folder, 'book.json');
            try {
              if (fs.existsSync(bookJsonPath)) {
                const bookData = JSON.parse(fs.readFileSync(bookJsonPath, 'utf-8'));
                books.push({
                  id: folder,
                  title: bookData.Title,
                  author: bookData.Author,
                  language: bookData.Language,
                  genres: bookData.Genres || []
                });

                // Count authors
                if (bookData.Author) {
                  authorsSet.add(bookData.Author);
                }

                // Count languages
                if (bookData.Language) {
                  languageCounts[bookData.Language] = (languageCounts[bookData.Language] || 0) + 1;
                }

                // Count genres
                if (bookData.Genres) {
                  bookData.Genres.forEach(genre => {
                    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                  });
                }

                // Initialize book stats
                bookStats[folder] = {
                  reads: 0,
                  favorites: 0
                };
              }
            } catch (fileError) {
              console.error(`Error processing file ${bookJsonPath}:`, fileError);
            }
          });

          // Get reads data
          const reads = readReads();
          let totalReads = 0;
          Object.keys(reads).forEach(userEmail => {
            Object.keys(reads[userEmail]).forEach(bookId => {
              if (reads[userEmail][bookId]) {
                totalReads++;
                if (bookStats[bookId]) {
                  bookStats[bookId].reads++;
                }
              }
            });
          });

          // Get favorites data
          const favoritesDir = path.join(__dirname, 'favorites');
          let totalFavorites = 0;
          if (fs.existsSync(favoritesDir)) {
            const userFiles = fs.readdirSync(favoritesDir);
            userFiles.forEach(file => {
              if (file.endsWith('.json')) {
                try {
                  const favoritesData = JSON.parse(fs.readFileSync(path.join(favoritesDir, file), 'utf8'));
                  favoritesData.forEach(bookId => {
                    totalFavorites++;
                    if (bookStats[bookId]) {
                      bookStats[bookId].favorites++;
                    }
                  });
                } catch (error) {
                  console.error('Error reading favorites file:', error);
                }
              }
            });
          }

          // Calculate top books
          const topBooks = books.map(book => ({
            ...book,
            reads: bookStats[book.id]?.reads || 0,
            favorites: bookStats[book.id]?.favorites || 0
          })).sort((a, b) => (b.reads + b.favorites) - (a.reads + a.favorites)).slice(0, 5);

          // Calculate top authors
          const authorStats = {};
          books.forEach(book => {
            if (!authorStats[book.author]) {
              authorStats[book.author] = {
                name: book.author,
                publications: 0,
                totalReads: 0
              };
            }
            authorStats[book.author].publications++;
            authorStats[book.author].totalReads += bookStats[book.id]?.reads || 0;
          });

          const topAuthors = Object.values(authorStats)
            .sort((a, b) => (b.publications + b.totalReads) - (a.publications + a.totalReads))
            .slice(0, 5);

          // Format distributions
          const languageDistribution = Object.entries(languageCounts)
            .map(([language, count]) => ({ language, count }))
            .sort((a, b) => b.count - a.count);

          const genreDistribution = Object.entries(genreCounts)
            .map(([genre, count]) => ({ genre, count }))
            .sort((a, b) => b.count - a.count);

          // Generate recent activity (mock data for now)
          const recentActivity = [
            {
              type: 'read',
              description: 'New book read: "Empowering Communities"',
              time: '2 hours ago'
            },
            {
              type: 'favorite',
              description: 'Book added to favorites: "The Future of Education"',
              time: '4 hours ago'
            },
            {
              type: 'book',
              description: 'New book published: "Digital Transformation"',
              time: '1 day ago'
            },
            {
              type: 'user',
              description: 'New reader registered: John Doe',
              time: '2 days ago'
            }
          ];

          res.json({
            totalReaders,
            totalAuthors: authorsSet.size,
            totalBooks: books.length,
            totalReads,
            totalFavorites,
            topBooks,
            topAuthors,
            languageDistribution,
            genreDistribution,
            recentActivity
          });
        });
      })
      .on('error', (err) => {
        console.error('Error reading CSV file:', err);
        res.status(500).json({ error: 'Internal server error.' });
      });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics.' });
  }
});

// Comments and Reviews Endpoints

// Get comments for a book (with replies)
app.get('/api/comments/:bookId', (req, res) => {
  const { bookId } = req.params;
  
  db.all(`
    SELECT c.*, 
           CASE WHEN c.parent_id IS NOT NULL THEN 'reply' ELSE 'comment' END as type
    FROM comments c 
    WHERE c.book_id = ? 
    ORDER BY c.parent_id ASC, c.created_at ASC
  `, [bookId], (err, comments) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
    
    // Organize comments into a tree structure
    const commentTree = [];
    const commentMap = {};
    
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });
    
    comments.forEach(comment => {
      if (comment.parent_id) {
        // This is a reply
        if (commentMap[comment.parent_id]) {
          commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
        }
      } else {
        // This is a top-level comment
        commentTree.push(commentMap[comment.id]);
      }
    });
    
    res.json(commentTree);
  });
});

// Add a comment or reply
app.post('/api/comments', (req, res) => {
  const { bookId, userEmail, userName, comment, parentId } = req.body;
  
  if (!bookId || !userEmail || !userName || !comment) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const params = parentId ? [bookId, userEmail, userName, comment, parentId] : [bookId, userEmail, userName, comment, null];
  const query = parentId 
    ? 'INSERT INTO comments (book_id, user_email, user_name, comment, parent_id) VALUES (?, ?, ?, ?, ?)'
    : 'INSERT INTO comments (book_id, user_email, user_name, comment, parent_id) VALUES (?, ?, ?, ?, ?)';
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error adding comment:', err);
      return res.status(500).json({ error: 'Failed to add comment' });
    }
    res.json({ id: this.lastID, message: parentId ? 'Reply added successfully' : 'Comment added successfully' });
  });
});

// Delete a comment (only by the comment author)
app.delete('/api/comments/:commentId', (req, res) => {
  const { commentId } = req.params;
  const { userEmail } = req.body;
  
  if (!userEmail) {
    return res.status(400).json({ error: 'User email is required' });
  }
  
  // First check if the comment exists and belongs to the user
  db.get('SELECT * FROM comments WHERE id = ? AND user_email = ?', [commentId, userEmail], (err, comment) => {
    if (err) {
      console.error('Error checking comment ownership:', err);
      return res.status(500).json({ error: 'Failed to check comment ownership' });
    }
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or you do not have permission to delete it' });
    }
    
    // Delete the comment
    db.run('DELETE FROM comments WHERE id = ?', [commentId], function(err) {
      if (err) {
        console.error('Error deleting comment:', err);
        return res.status(500).json({ error: 'Failed to delete comment' });
      }
      res.json({ message: 'Comment deleted successfully' });
    });
  });
});

// Get reviews for a book
app.get('/api/reviews/:bookId', (req, res) => {
  const { bookId } = req.params;
  
  db.all('SELECT * FROM reviews WHERE book_id = ? ORDER BY created_at DESC', [bookId], (err, reviews) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
    res.json(reviews);
  });
});

// Add or update a review
app.post('/api/reviews', (req, res) => {
  const { bookId, userEmail, userName, rating, reviewText } = req.body;
  
  if (!bookId || !userEmail || !userName || !rating) {
    return res.status(400).json({ error: 'Book ID, user email, user name, and rating are required' });
  }
  
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  
  // Check if user already has a review for this book
  db.get('SELECT id FROM reviews WHERE book_id = ? AND user_email = ?', [bookId, userEmail], (err, existingReview) => {
    if (err) {
      console.error('Error checking existing review:', err);
      return res.status(500).json({ error: 'Failed to check existing review' });
    }
    
    if (existingReview) {
      // Update existing review
      db.run(
        'UPDATE reviews SET rating = ?, review_text = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
        [rating, reviewText, existingReview.id],
        function(err) {
          if (err) {
            console.error('Error updating review:', err);
            return res.status(500).json({ error: 'Failed to update review' });
          }
          res.json({ id: existingReview.id, message: 'Review updated successfully' });
        }
      );
    } else {
      // Add new review
      db.run(
        'INSERT INTO reviews (book_id, user_email, user_name, rating, review_text) VALUES (?, ?, ?, ?, ?)',
        [bookId, userEmail, userName, rating, reviewText],
        function(err) {
          if (err) {
            console.error('Error adding review:', err);
            return res.status(500).json({ error: 'Failed to add review' });
          }
          res.json({ id: this.lastID, message: 'Review added successfully' });
        }
      );
    }
  });
});

// Get average rating for a book
app.get('/api/reviews/:bookId/average', (req, res) => {
  const { bookId } = req.params;
  
  db.get('SELECT AVG(rating) as averageRating, COUNT(*) as totalReviews FROM reviews WHERE book_id = ?', [bookId], (err, result) => {
    if (err) {
      console.error('Error fetching average rating:', err);
      return res.status(500).json({ error: 'Failed to fetch average rating' });
    }
    res.json({
      averageRating: result.averageRating ? parseFloat(result.averageRating.toFixed(1)) : 0,
      totalReviews: result.totalReviews
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});