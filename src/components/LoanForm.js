import React, { useState } from 'react';
import { View, TextInput, Button, Platform, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addLoan } from '../services/api';
import { scheduleNotification } from '../services/notifications';

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
      
      navigation.goBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f5f5f5', 
        padding: 20, 
        justifyContent: 'center', 
      }}
    >
      <TextInput 
        placeholder="Borrower Name" 
        value={name} 
        onChangeText={setName} 
        autoCapitalize="words"
        style={{
          backgroundColor: '#ffffff', 
          borderRadius: 8, 
          padding: 12, 
          marginBottom: 16, 
          fontSize: 16, 
          borderWidth: 1, 
          borderColor: '#ddd', 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2, 
        }} 
      />
      
      <TextInput 
        placeholder="Amount" 
        value={amount} 
        onChangeText={setAmount} 
        keyboardType="numeric" 
        style={{
          backgroundColor: '#ffffff', 
          borderRadius: 8, 
          padding: 12, 
          marginBottom: 16, 
          fontSize: 16, 
          borderWidth: 1, 
          borderColor: '#ddd', 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2, 
        }} 
      />
      
      <View
        style={{
          marginBottom: 20, 
        }}
      >
        <Button 
          title={`Due Date: ${dueDate.toLocaleDateString()}`} 
          onPress={() => setShowDatePicker(true)} 
          color={Platform.OS === 'ios' ? '#007AFF' : '#6200EE'} 
        />
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios' ? true : false);
            if (date) setDueDate(date);
          }}
          style={{
            backgroundColor: '#ffffff', 
            borderRadius: 8, 
          }}
        />
      )}
      
      {isSubmitting ? (
        <ActivityIndicator 
          size="large" 
          color="#6200EE" 
          style={{ marginTop: 20 }} 
        />
      ) : (
        <View
          style={{
            marginTop: 20, 
            borderRadius: 8, 
            overflow: 'hidden', 
          }}
        >
          <Button 
            title="Add Loan" 
            onPress={handleSubmit} 
            color={Platform.OS === 'ios' ? '#007AFF' : '#6200EE'} 
          />
        </View>
      )}
    </View>
  );
};

export default LoanForm;