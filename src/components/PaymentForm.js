import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { addPayment } from '../services/api';
import { styles } from '../styles/globalStyles';

const PaymentForm = ({ loanId, onPaymentAdded }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = async () => {
    await addPayment(loanId, { amount: parseFloat(amount) });
    setAmount('');
    onPaymentAdded();
  };

  return (
    <View>
      <TextInput
        placeholder="Payment Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Add Payment" onPress={handleSubmit} />
    </View>
  );
};

export default PaymentForm;