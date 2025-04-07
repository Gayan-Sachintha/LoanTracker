const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

/**
 * Initialize database connection and create tables if they don't exist
 * @returns {Promise<sqlite.Database>} Database connection
 */
const initializeDatabase = async () => {
  try {
    // Open database connection
    const db = await open({
      filename: path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    
    // Create loans table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        dueDate TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create payments table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loanId INTEGER NOT NULL,
        amount REAL NOT NULL,
        paymentDate TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loanId) REFERENCES loans(id) ON DELETE CASCADE
      );
    `);
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Export a singleton database connection
let dbInstance = null;

const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await initializeDatabase();
  }
  return dbInstance;
};

module.exports = {
  getDatabase
};