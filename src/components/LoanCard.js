import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/globalStyles';

const LoanCard = ({ loan, navigation }) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
      activeOpacity={0.8} 
    >
      <View
        style={{
          backgroundColor: '#ffffff', 
          borderRadius: 12, 
          padding: 16, 
          marginVertical: 8, 
          marginHorizontal: 16, 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3, 
          borderWidth: 1,
          borderColor: '#f0f0f0', 
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333', 
            marginBottom: 8, 
          }}
        >
          {loan.name}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: '#2ecc71', 
            marginBottom: 4,
          }}
        >
          Amount: LKR:{loan.amount}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#e74c3c', 
          }}
        >
          Due: {loan.dueDate}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default LoanCard;