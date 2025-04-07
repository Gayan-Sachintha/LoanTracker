import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Button, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LoanCard from '../components/LoanCard';
import { getLoans } from '../services/api';
import { styles } from '../styles/globalStyles';

const HomeScreen = ({ navigation }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await getLoans();
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch loans when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchLoans();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLoans();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <>
          {loans.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No loans yet. Add your first loan!</Text>
            </View>
          ) : (
            <FlatList
              data={loans}
              renderItem={({ item }) => (
                <LoanCard loan={item} navigation={navigation} />
              )}
              keyExtractor={(item) => item.id.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
          <Button
            title="Add Loan"
            onPress={() => navigation.navigate('AddLoan')}
          />
        </>
      )}
    </View>
  );
};

export default HomeScreen;