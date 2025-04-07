const { getDatabase } = require('../db/database');

/**
 * Loan model with CRUD operations
 */
class Loan {
  /**
   * Get all loans from the database
   * @returns {Promise<Array>} Array of loan objects
   */
  static async getAll() {
    try {
      const db = await getDatabase();
      const loans = await db.all('SELECT * FROM loans ORDER BY dueDate ASC');
      
      // Get payments for each loan
      for (const loan of loans) {
        loan.payments = await db.all('SELECT * FROM payments WHERE loanId = ? ORDER BY paymentDate ASC', loan.id);
        
        // Calculate remaining amount
        const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
        loan.remainingAmount = loan.amount - totalPaid;
      }
      
      return loans;
    } catch (error) {
      console.error('Error getting all loans:', error);
      throw error;
    }
  }

  /**
   * Get a single loan by ID
   * @param {number} id - Loan ID
   * @returns {Promise<Object>} Loan object with payments
   */
  static async getById(id) {
    try {
      const db = await getDatabase();
      const loan = await db.get('SELECT * FROM loans WHERE id = ?', id);
      
      if (!loan) {
        return null;
      }
      
      // Get payments for the loan
      loan.payments = await db.all('SELECT * FROM payments WHERE loanId = ? ORDER BY paymentDate ASC', id);
      
      // Calculate remaining amount
      const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
      loan.remainingAmount = loan.amount - totalPaid;
      
      return loan;
    } catch (error) {
      console.error(`Error getting loan by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new loan
   * @param {Object} loanData - Loan data
   * @returns {Promise<Object>} Created loan object
   */
  static async create(loanData) {
    try {
      const db = await getDatabase();
      const result = await db.run(
        'INSERT INTO loans (name, amount, dueDate) VALUES (?, ?, ?)',
        [loanData.name, loanData.amount, loanData.dueDate]
      );
      
      return { id: result.lastID, ...loanData, payments: [] };
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  }

  /**
   * Update an existing loan
   * @param {number} id - Loan ID
   * @param {Object} loanData - Updated loan data
   * @returns {Promise<boolean>} Success status
   */
  static async update(id, loanData) {
    try {
      const db = await getDatabase();
      const { name, amount, dueDate } = loanData;
      
      await db.run(
        'UPDATE loans SET name = ?, amount = ?, dueDate = ? WHERE id = ?',
        [name, amount, dueDate, id]
      );
      
      return true;
    } catch (error) {
      console.error(`Error updating loan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a loan and its payments
   * @param {number} id - Loan ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    try {
      const db = await getDatabase();
      
      // Delete loan (payments will cascade delete due to foreign key constraint)
      await db.run('DELETE FROM loans WHERE id = ?', id);
      
      return true;
    } catch (error) {
      console.error(`Error deleting loan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add a payment to a loan
   * @param {number} loanId - Loan ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Created payment object
   */
  static async addPayment(loanId, paymentData) {
    try {
      const db = await getDatabase();
      
      // Check if loan exists
      const loan = await db.get('SELECT * FROM loans WHERE id = ?', loanId);
      if (!loan) {
        throw new Error(`Loan with ID ${loanId} not found`);
      }
      
      // Extract payment fields
      const { amount, isInstallment, installmentNumber, totalInstallments, frequency } = paymentData;
      
      // For SQLite, you'll need to update your schema to include these fields
      const result = await db.run(
        `INSERT INTO payments (
          loanId, 
          amount, 
          isInstallment, 
          installmentNumber, 
          totalInstallments, 
          frequency
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          loanId, 
          amount, 
          isInstallment ? 1 : 0, 
          installmentNumber || null, 
          totalInstallments || null, 
          frequency || null
        ]
      );
      
      return { 
        id: result.lastID, 
        loanId, 
        amount,
        isInstallment,
        installmentNumber,
        totalInstallments,
        frequency,
        paymentDate: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error adding payment to loan ${loanId}:`, error);
      throw error;
    }
  }

  /**
   * Get overdue loans
   * @returns {Promise<Array>} Array of overdue loan objects
   */
  static async getOverdueLoans() {
    try {
      const db = await getDatabase();
      const currentDate = new Date().toISOString().split('T')[0];
      
      const overdueLoans = await db.all(
        'SELECT * FROM loans WHERE dueDate < ? ORDER BY dueDate ASC',
        currentDate
      );
      
      // Get payments for each loan
      for (const loan of overdueLoans) {
        loan.payments = await db.all('SELECT * FROM payments WHERE loanId = ?', loan.id);
        
        // Calculate remaining amount
        const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
        loan.remainingAmount = loan.amount - totalPaid;
      }
      
      return overdueLoans;
    } catch (error) {
      console.error('Error getting overdue loans:', error);
      throw error;
    }
  }

  static async deletePayment(loanId, paymentId) {
    try {
      const db = await getDatabase();
      
      // Check if payment exists
      const payment = await db.get('SELECT * FROM payments WHERE id = ? AND loanId = ?', [paymentId, loanId]);
      if (!payment) {
        throw new Error(`Payment with ID ${paymentId} not found`);
      }
      
      await db.run('DELETE FROM payments WHERE id = ? AND loanId = ?', [paymentId, loanId]);
      return true;
    } catch (error) {
      console.error(`Error deleting payment ${paymentId}:`, error);
      throw error;
    }
  }

  static async updatePayment(loanId, paymentId, paymentData) {
    try {
      const db = await getDatabase();
      
      const payment = await db.get('SELECT * FROM payments WHERE id = ? AND loanId = ?', [paymentId, loanId]);
      if (!payment) {
        throw new Error(`Payment with ID ${paymentId} not found`);
      }
      
      await db.run(
        'UPDATE payments SET amount = ? WHERE id = ? AND loanId = ?',
        [paymentData.amount, paymentId, loanId]
      );
      
      return { ...payment, amount: paymentData.amount };
    } catch (error) {
      console.error(`Error updating payment ${paymentId}:`, error);
      throw error;
    }
  }
}

module.exports = Loan;