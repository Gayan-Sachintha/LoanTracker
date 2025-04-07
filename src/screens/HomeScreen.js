import React, { useEffect, useState } from 'react';
import { View, FlatList, Button } from 'react-native';
import LoanCard from '../components/LoanCard';
import { getLoans } from '../services/api';
import { styles } from '../styles/globalStyles';

const HomeScreen = ({ navigation }) => {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    const response = await getLoans();
    setLoans(response.data);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={loans}
        renderItem={({ item }) => (
          <LoanCard loan={item} navigation={navigation} />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <Button
        title="Add Loan"
        onPress={() => navigation.navigate('AddLoan')}
      />
    </View>
  );
};

export default HomeScreen;