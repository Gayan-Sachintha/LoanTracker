import axios from 'axios';

const API_URL = 'http://localhost:3000'; 

export const getLoans = () => axios.get(`${API_URL}/loans`);
export const getLoanById = (id) => axios.get(`${API_URL}/loans/${id}`);
export const addLoan = (loan) => axios.post(`${API_URL}/loans`, loan);
export const deleteLoan = (id) => axios.delete(`${API_URL}/loans/${id}`);
export const addPayment = (loanId, payment) =>
  axios.post(`${API_URL}/loans/${loanId}/payments`, payment);