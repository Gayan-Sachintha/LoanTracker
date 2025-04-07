import React, { useState } from 'react';
import { View, TextInput, Button, Platform, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addLoan } from '../services/api';
import { scheduleNotification } from '../services/notifications';
import { styles } from '../styles/globalStyles';

const LoanForm = ({ navigation }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a borrower name');
      return false;
    }
    
    if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid loan amount');
      return false;
    }
    
    if (!dueDate) {
      Alert.alert('Error', 'Please select a due date');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const loan = { 
        name, 
        amount: parseFloat(amount), 
        dueDate: dueDate.toISOString() 
      };
      
      const response = await addLoan(loan);
      
      // Schedule notification regardless of online/offline status
      await scheduleNotification(name, dueDate);
      
      Alert.alert(
        'Success',
        'Loan has been added successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving loan:', error);
      Alert.alert(
        'Error',
        'There was a problem adding the loan. Data has been saved locally.'
      );
      // Navigate back anyway since we're saving offline
      navigation.goBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder="Borrower Name" 
        value={name} 
        onChangeText={setName} 
        style={styles.input} 
        autoCapitalize="words"
      />
      
      <TextInput 
        placeholder="Amount" 
        value={amount} 
        onChangeText={setAmount} 
        keyboardType="numeric" 
        style={styles.input} 
      />
      
      <Button 
        title={`Due Date: ${dueDate.toLocaleDateString()}`} 
        onPress={() => setShowDatePicker(true)} 
      />
      
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
      
      {isSubmitting ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <Button title="Add Loan" onPress={handleSubmit} style={{ marginTop: 20 }} />
      )}
    </View>
  );
};

export default LoanForm;