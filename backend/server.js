const express = require('express');
const { getDatabase } = require('./db/database'); // Import the database module
const Loan = require('./models/loan'); // Import the Loan model
const app = express();
app.use(express.json());

// Initialize the database connection
let db;
const initializeServer = async () => {
  try {
    // Get database connection using the getDatabase function
    db = await getDatabase();
    
    console.log('Database connected successfully');
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// API Routes
app.get('/loans', async (req, res) => {
  try {
    const loans = await Loan.getAll();
    res.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

app.get('/loans/:id', async (req, res) => {
  try {
    const loan = await Loan.getById(parseInt(req.params.id));
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json(loan);
  } catch (error) {
    console.error(`Error fetching loan ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch loan' });
  }
});

app.post('/loans', async (req, res) => {
  try {
    const { name, amount, dueDate } = req.body;
    const newLoan = await Loan.create({ name, amount, dueDate });
    res.status(201).json(newLoan);
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ error: 'Failed to create loan' });
  }
});

app.delete('/loans/:id', async (req, res) => {
  try {
    const success = await Loan.delete(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error(`Error deleting loan ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete loan' });
  }
});

app.post('/loans/:id/payments', async (req, res) => {
  try {
    const { amount } = req.body;
    const payment = await Loan.addPayment(parseInt(req.params.id), { amount });
    res.status(201).json(payment);
  } catch (error) {
    console.error(`Error adding payment to loan ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

// Initialize the server
initializeServer();