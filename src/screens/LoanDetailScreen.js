import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import PaymentForm from '../components/PaymentForm';
import { getLoanById, deleteLoan } from '../services/api';
import { styles } from '../styles/globalStyles';

const LoanDetailScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);

  useEffect(() => {
    fetchLoan();
  }, []);

  const fetchLoan = async () => {
    const response = await getLoanById(loanId);
    setLoan(response.data);
  };

  const handleDelete = async () => {
    await deleteLoan(loanId);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {loan && (
        <>
          <Text>Name: {loan.name}</Text>
          <Text>Amount: ${loan.amount}</Text>
          <Text>Due Date: {loan.dueDate}</Text>
          <PaymentForm loanId={loanId} onPaymentAdded={fetchLoan} />
          <Button title="Delete Loan" onPress={handleDelete} />
        </>
      )}
    </View>
  );
};

export default LoanDetailScreen;