import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
const LOANS_STORAGE_KEY = '@LoanTracker:loans';

/**
 * Save loans to AsyncStorage
 * @param {Array} loans - Array of loan objects
 */
export const saveLoansToStorage = async (loans) => {
  try {
    await AsyncStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
    return true;
  } catch (error) {
    console.error('Error saving loans to storage:', error);
    return false;
  }
};

/**
 * Get loans from AsyncStorage
 * @returns {Array} Array of loan objects or empty array if none found
 */
export const getLoansFromStorage = async () => {
  try {
    const loansJson = await AsyncStorage.getItem(LOANS_STORAGE_KEY);
    return loansJson ? JSON.parse(loansJson) : [];
  } catch (error) {
    console.error('Error getting loans from storage:', error);
    return [];
  }
};

/**
 * Add a loan to storage
 * @param {Object} loan - Loan object to add
 */
export const addLoanToStorage = async (loan) => {
  try {
    const loans = await getLoansFromStorage();
    loans.push(loan);
    await saveLoansToStorage(loans);
    return true;
  } catch (error) {
    console.error('Error adding loan to storage:', error);
    return false;
  }
};

/**
 * Update a loan in storage
 * @param {string} loanId - ID of loan to update
 * @param {Object} updatedLoan - Updated loan object
 */
export const updateLoanInStorage = async (loanId, updatedLoan) => {
  try {
    const loans = await getLoansFromStorage();
    const index = loans.findIndex(loan => loan.id === loanId);
    
    if (index !== -1) {
      loans[index] = { ...loans[index], ...updatedLoan };
      await saveLoansToStorage(loans);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating loan in storage:', error);
    return false;
  }
};

/**
 * Delete a loan from storage
 * @param {string} loanId - ID of loan to delete
 */
export const deleteLoanFromStorage = async (loanId) => {
  try {
    const loans = await getLoansFromStorage();
    const filteredLoans = loans.filter(loan => loan.id !== loanId);
    await saveLoansToStorage(filteredLoans);
    return true;
  } catch (error) {
    console.error('Error deleting loan from storage:', error);
    return false;
  }
};

/**
 * Add a payment to a loan in storage
 * @param {string} loanId - ID of loan to add payment to
 * @param {Object} payment - Payment object to add
 */
export const addPaymentToLoanInStorage = async (loanId, payment) => {
  try {
    const loans = await getLoansFromStorage();
    const index = loans.findIndex(loan => loan.id === loanId);
    
    if (index !== -1) {
      if (!loans[index].payments) {
        loans[index].payments = [];
      }
      loans[index].payments.push(payment);
      await saveLoansToStorage(loans);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding payment to loan in storage:', error);
    return false;
  }
};

/**
 * Sync local storage with server data
 * @param {Array} serverLoans - Loans from the server
 */
export const syncLoansWithServer = async (serverLoans) => {
  try {
    await saveLoansToStorage(serverLoans);
    return true;
  } catch (error) {
    console.error('Error syncing loans with server:', error);
    return false;
  }
};