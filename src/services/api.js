import axios from 'axios';
import { 
  saveLoansToStorage, 
  getLoansFromStorage, 
  addLoanToStorage, 
  deleteLoanFromStorage, 
  addPaymentToLoanInStorage 
} from '../utils/storage';

const API_URL = 'http://localhost:3000'; 
const isServerAvailable = async () => {
  try {
    await axios.get(`${API_URL}/loans/health`);
    return true;
  } catch (error) {
    console.log('Server unavailable, using offline storage');
    return false;
  }
};

// Generate a unique ID for offline items
const generateUniqueId = () => {
  return 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const getLoans = async () => {
  try {
    if (await isServerAvailable()) {
      const response = await axios.get(`${API_URL}/loans`);
      await saveLoansToStorage(response.data);
      return { data: response.data };
    } else {
      const loans = await getLoansFromStorage();
      return { data: loans };
    }
  } catch (error) {
    console.error('Error fetching loans:', error);
    const loans = await getLoansFromStorage();
    return { data: loans };
  }
};

export const getLoanById = async (id) => {
  try {
    if (await isServerAvailable()) {
      const response = await axios.get(`${API_URL}/loans/${id}`);
      return { data: response.data };
    } else {
      const loans = await getLoansFromStorage();
      const loan = loans.find(l => l.id === id);
      return { data: loan };
    }
  } catch (error) {
    console.error(`Error fetching loan ${id}:`, error);
    const loans = await getLoansFromStorage();
    const loan = loans.find(l => l.id === id);
    return { data: loan };
  }
};

export const addLoan = async (loan) => {
  try {
    if (await isServerAvailable()) {
      const response = await axios.post(`${API_URL}/loans`, loan);
      // Update local storage with the new loan
      await addLoanToStorage(response.data);
      return response;
    } else {
      // Create an offline ID and save locally
      const offlineLoan = { ...loan, id: generateUniqueId(), payments: [] };
      await addLoanToStorage(offlineLoan);
      return { data: offlineLoan };
    }
  } catch (error) {
    console.error('Error adding loan:', error);
    // Fall back to local storage if server request fails
    const offlineLoan = { ...loan, id: generateUniqueId(), payments: [] };
    await addLoanToStorage(offlineLoan);
    return { data: offlineLoan };
  }
};

export const deleteLoan = async (id) => {
  try {
    if (await isServerAvailable()) {
      await axios.delete(`${API_URL}/loans/${id}`);
    }
    // Always delete from local storage
    await deleteLoanFromStorage(id);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting loan ${id}:`, error);
    // Still try to delete from local storage on error
    await deleteLoanFromStorage(id);
    return { success: true };
  }
};

export const addPayment = async (loanId, payment) => {
    try {
      if (await isServerAvailable()) {
        const response = await axios.post(`${API_URL}/loans/${loanId}/payments`, payment);
        // Update local storage with the new payment
        await addPaymentToLoanInStorage(loanId, response.data);
        return response;
      } else {
        // Create an offline payment and save locally
        const offlinePayment = { 
          ...payment, 
          id: generateUniqueId(),
          paymentDate: new Date().toISOString()
        };
        await addPaymentToLoanInStorage(loanId, offlinePayment);
        return { data: offlinePayment };
      }
    } catch (error) {
      console.error(`Error adding payment to loan ${loanId}:`, error);
      // Fall back to local storage if server request fails
      const offlinePayment = { 
        ...payment, 
        id: generateUniqueId(),
        paymentDate: new Date().toISOString()
      };
      await addPaymentToLoanInStorage(loanId, offlinePayment);
      return { data: offlinePayment };
    }
  };

  export const deletePayment = async (loanId, paymentId) => {
    try {
      if (await isServerAvailable()) {
        await axios.delete(`${API_URL}/loans/${loanId}/payments/${paymentId}`);
      }
      // Update local storage
      const loans = await getLoansFromStorage();
      const updatedLoans = loans.map(loan => {
        if (loan.id === loanId) {
          loan.payments = loan.payments.filter(payment => payment.id !== paymentId);
        }
        return loan;
      });
      await saveLoansToStorage(updatedLoans);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting payment ${paymentId}:`, error);
      // Still try to delete from local storage on error
      const loans = await getLoansFromStorage();
      const updatedLoans = loans.map(loan => {
        if (loan.id === loanId) {
          loan.payments = loan.payments.filter(payment => payment.id !== paymentId);
        }
        return loan;
      });
      await saveLoansToStorage(updatedLoans);
      return { success: true };
    }
  };

  export const updatePayment = async (loanId, paymentId, paymentData) => {
    try {
      if (await isServerAvailable()) {
        const response = await axios.put(`${API_URL}/loans/${loanId}/payments/${paymentId}`, paymentData);
        const loans = await getLoansFromStorage();
        const updatedLoans = loans.map(loan => {
          if (loan.id === loanId) {
            loan.payments = loan.payments.map(payment => 
              payment.id === paymentId ? { ...payment, ...paymentData } : payment
            );
          }
          return loan;
        });
        await saveLoansToStorage(updatedLoans);
        return response;
      } else {
        const loans = await getLoansFromStorage();
        const updatedLoans = loans.map(loan => {
          if (loan.id === loanId) {
            loan.payments = loan.payments.map(payment => 
              payment.id === paymentId ? { ...payment, ...paymentData } : payment
            );
          }
          return loan;
        });
        await saveLoansToStorage(updatedLoans);
        return { data: { ...paymentData, id: paymentId, loanId } };
      }
    } catch (error) {
      console.error(`Error updating payment ${paymentId}:`, error);
      throw error;
    }
  };
  