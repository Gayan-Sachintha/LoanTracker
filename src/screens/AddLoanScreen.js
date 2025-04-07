import React from 'react';
import { View } from 'react-native';
import LoanForm from '../components/LoanForm';
import { styles } from '../styles/globalStyles';

const AddLoanScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <LoanForm navigation={navigation} />
    </View>
  );
};

export default AddLoanScreen;