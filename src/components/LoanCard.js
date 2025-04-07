import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/globalStyles';

const LoanCard = ({ loan, navigation }) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
    >
      <View style={styles.card}>
        <Text>{loan.name}</Text>
        <Text>Amount: LKR:{loan.amount}</Text>
        <Text>Due: {loan.dueDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default LoanCard;