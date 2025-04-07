import React, { useState } from 'react';
import { View, TextInput, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addLoan } from '../services/api';
import { scheduleNotification } from '../services/notifications';
import { styles } from '../styles/globalStyles';

const LoanForm = ({ navigation }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    const loan = { name, amount: parseFloat(amount), dueDate: dueDate.toISOString() };
    await addLoan(loan);
    scheduleNotification(name, dueDate);
    navigation.goBack();
  };

  return (
    <View>
      <TextInput placeholder="Borrower Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} />
      <Button title="Pick Due Date" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios' ? true : false);
            if (date) setDueDate(date);
          }}
        />
      )}
      <Button title="Add Loan" onPress={handleSubmit} />
    </View>
  );
};

export default LoanForm;