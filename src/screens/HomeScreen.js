import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Button, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LoanCard from '../components/LoanCard';
import { getLoans } from '../services/api';

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
    <View
      style={{
        flex: 1,
        backgroundColor: '#f5f5f5', 
        paddingTop: 20, 
      }}
    >
      {loading && !refreshing ? (
        <ActivityIndicator 
          size="large" 
          color="#6200EE" 
          style={{ marginTop: 20, flex: 1, justifyContent: 'center' }} 
        />
      ) : (
        <>
          {loans.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: '#666', 
                  textAlign: 'center',
                  fontWeight: '500',
                }}
              >
                No loans yet. Add your first loan!
              </Text>
            </View>
          ) : (
            <FlatList
              data={loans}
              renderItem={({ item }) => (
                <LoanCard loan={item} navigation={navigation} />
              )}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{
                paddingBottom: 80, 
              }}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  tintColor="#6200EE" 
                />
              }
            />
          )}
          <View
            style={{
              position: 'absolute', 
              bottom: 20,
              left: 20,
              right: 20,
              borderRadius: 8, 
              overflow: 'hidden', 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4, 
            }}
          >
            <Button
              title="Add Loan"
              onPress={() => navigation.navigate('AddLoan')}
              color={Platform.OS === 'ios' ? '#007AFF' : '#6200EE'} 
            />
          </View>
        </>
      )}
    </View>
  );
};

export default HomeScreen;