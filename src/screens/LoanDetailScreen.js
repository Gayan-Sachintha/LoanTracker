import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput
} from 'react-native';
import { getLoanById, deleteLoan, addPayment, deletePayment, updatePayment } from '../services/api';

const LoanDetailScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editInstallmentModalVisible, setEditInstallmentModalVisible] = useState(false);
  const [editPaymentModalVisible, setEditPaymentModalVisible] = useState(false); 
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentOption, setPaymentOption] = useState('full');
  const [numberOfInstallments, setNumberOfInstallments] = useState('');
  const [installmentFrequency, setInstallmentFrequency] = useState('monthly');
  const [sameWeekPayments, setSameWeekPayments] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null); 
  const [additionalPaymentAmount, setAdditionalPaymentAmount] = useState('');

  useEffect(() => {
    fetchLoan();
  }, []);

  const fetchLoan = async () => {
    setLoading(true);
    try {
      const response = await getLoanById(loanId);
      setLoan(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load loan details');
      console.error('Error fetching loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePayment(loanId, paymentId);
              fetchLoan();
              Alert.alert('Success', 'Payment deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete payment');
              console.error('Error deleting payment:', error);
            }
          }
        }
      ]
    );
  };

  const handleEditInstallmentPlan = () => {
    setEditInstallmentModalVisible(true);
    const status = getInstallmentStatus();
    if (status) {
      setPaymentAmount((status.amount * status.total).toString());
      setNumberOfInstallments(status.total.toString());
      setInstallmentFrequency(status.frequency);
    }
  };

  const handleUpdateInstallmentPlan = async () => {
    try {
      if (!paymentAmount || !numberOfInstallments) {
        Alert.alert('Error', 'Please enter both amount and number of installments');
        return;
      }

      const installmentPayments = loan.payments.filter(p => p.isInstallment);
      for (const payment of installmentPayments) {
        await deletePayment(loanId, payment.id);
      }

      const installmentAmount = parseFloat(paymentAmount) / parseInt(numberOfInstallments);
      for (let i = 0; i < parseInt(numberOfInstallments); i++) {
        await addPayment(loanId, {
          amount: installmentAmount,
          isInstallment: true,
          installmentNumber: i + 1,
          totalInstallments: parseInt(numberOfInstallments),
          frequency: installmentFrequency
        });
      }

      setEditInstallmentModalVisible(false);
      setPaymentAmount('');
      setNumberOfInstallments('');
      fetchLoan();
      Alert.alert('Success', 'Installment plan updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update installment plan');
      console.error('Error updating installment plan:', error);
    }
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setAdditionalPaymentAmount(payment.amount.toString());
    setEditPaymentModalVisible(true);
  };

  const handleUpdatePayment = async () => {
    try {
      if (!additionalPaymentAmount || isNaN(parseFloat(additionalPaymentAmount))) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      await updatePayment(loanId, selectedPayment.id, { amount: parseFloat(additionalPaymentAmount) });
      setEditPaymentModalVisible(false);
      setAdditionalPaymentAmount('');
      setSelectedPayment(null);
      fetchLoan();
      Alert.alert('Success', 'Payment updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update payment');
      console.error('Error updating payment:', error);
    }
  };

  const handleAddAdditionalPayment = async () => {
    try {
      const status = getInstallmentStatus();
      if (!status) {
        Alert.alert('Error', 'No existing installment plan found');
        return;
      }

      const installmentNumber = status.completed + 1;
      if (installmentNumber > status.total) {
        Alert.alert('Error', 'All installments already completed');
        return;
      }

      await addPayment(loanId, {
        amount: status.amount,
        isInstallment: true,
        installmentNumber: installmentNumber,
        totalInstallments: status.total,
        frequency: status.frequency
      });

      fetchLoan();
      Alert.alert('Success', 'Additional installment payment added');
    } catch (error) {
      Alert.alert('Error', 'Failed to add additional payment');
      console.error('Error adding payment:', error);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this loan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLoan(loanId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete loan');
              console.error('Error deleting loan:', error);
            }
          }
        }
      ]
    );
  };

  const handlePayment = async () => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount)) || parseFloat(paymentAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }

    try {
      if (paymentOption === 'full') {
        await addPayment(loanId, { amount: parseFloat(paymentAmount) });
        setModalVisible(false);
        setPaymentAmount('');
        fetchLoan();
        Alert.alert('Success', 'Payment recorded successfully');
      } else {
        if (!numberOfInstallments || isNaN(parseInt(numberOfInstallments))) {
          Alert.alert('Error', 'Please enter a valid number of installments');
          return;
        }

        const installmentAmount = parseFloat(paymentAmount) / parseInt(numberOfInstallments);
        if (installmentFrequency === 'weekly' && sameWeekPayments > 1) {
          for (let i = 0; i < sameWeekPayments; i++) {
            await addPayment(loanId, {
              amount: installmentAmount,
              isInstallment: true,
              installmentNumber: i + 1,
              totalInstallments: parseInt(numberOfInstallments),
              frequency: installmentFrequency
            });
          }
        } else {
          await addPayment(loanId, {
            amount: installmentAmount,
            isInstallment: true,
            installmentNumber: 1,
            totalInstallments: parseInt(numberOfInstallments),
            frequency: installmentFrequency
          });
        }

        setModalVisible(false);
        setPaymentAmount('');
        setNumberOfInstallments('');
        fetchLoan();
        Alert.alert('Success', 'Installment plan created');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
      console.error('Error processing payment:', error);
    }
  };

  const calculateRemainingAmount = () => {
    if (!loan) return 0;
    const totalPaid = loan.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    return loan.amount - totalPaid;
  };

  const getInstallmentStatus = () => {
    if (!loan || !loan.payments) return null;

    const installmentPayments = loan.payments.filter(payment => payment.isInstallment);
    if (installmentPayments.length === 0) return null;

    const latestInstallment = installmentPayments.sort((a, b) =>
      new Date(b.paymentDate) - new Date(a.paymentDate)
    )[0];

    const completedInstallments = installmentPayments.filter(p =>
      p.totalInstallments === latestInstallment.totalInstallments
    ).length;

    return {
      completed: completedInstallments,
      total: latestInstallment.totalInstallments,
      frequency: latestInstallment.frequency,
      amount: latestInstallment.amount
    };
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading loan details...</Text>
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={styles.errorContainer}>
        <Text>Loan not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const remainingAmount = calculateRemainingAmount();
  const installmentStatus = getInstallmentStatus();

  return (
    <ScrollView style={styles.container}>
      {/* Loan Summary Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Loan Details</Text>
        <Text style={styles.borrowerName}>{loan.name}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Original Amount:</Text>
          <Text style={styles.detailValue}>LKR:{loan.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Due Date:</Text>
          <Text style={styles.detailValue}>{formatDate(loan.dueDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Paid:</Text>
          <Text style={styles.detailValue}>LKR:{(loan.amount - remainingAmount).toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Remaining Balance:</Text>
          <Text style={[
            styles.detailValue,
            styles.balanceText,
            remainingAmount <= 0 ? styles.paidOffText : null
          ]}>
            LKR:{Math.max(0, remainingAmount).toFixed(2)}
          </Text>
        </View>
        {remainingAmount <= 0 && (
          <View style={styles.paidOffBadge}>
            <Text style={styles.paidOffBadgeText}>PAID OFF</Text>
          </View>
        )}
      </View>

      {/* Installment Status Card */}
      {installmentStatus && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Installment Plan</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEditInstallmentPlan}>
                <Text style={styles.editText}>Edit Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddAdditionalPayment}>
                <Text style={styles.addText}>Add Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Progress:</Text>
            <Text style={styles.detailValue}>
              {installmentStatus.completed} of {installmentStatus.total} {installmentStatus.frequency} payments
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Each Payment:</Text>
            <Text style={styles.detailValue}>LKR:{installmentStatus.amount.toFixed(2)}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${(installmentStatus.completed / installmentStatus.total) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {((installmentStatus.completed / installmentStatus.total) * 100).toFixed(0)}% Complete
          </Text>
        </View>
      )}

      {/* Payment History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment History</Text>
        {loan.payments && loan.payments.length > 0 ? (
          <FlatList
            data={loan.payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.paymentItem}
                onPress={() => item.isInstallment && handleEditPayment(item)}
              >
                <View>
                  <Text style={styles.paymentDate}>{formatDate(item.paymentDate)}</Text>
                  {item.isInstallment && (
                    <Text style={styles.installmentNote}>
                      Installment {item.installmentNumber}/{item.totalInstallments}
                    </Text>
                  )}
                </View>
                <View style={styles.paymentRight}>
                  <Text style={styles.paymentAmount}>LKR:{item.amount.toFixed(2)}</Text>
                  <TouchableOpacity
                    style={styles.deletePaymentButton}
                    onPress={() => handleDeletePayment(item.id)}
                  >
                    <Text style={styles.deletePaymentText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.noPaymentsText}>No payments recorded yet</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.paymentButton]}
          onPress={() => setModalVisible(true)}
          disabled={remainingAmount <= 0}
        >
          <Text style={styles.buttonText}>Make Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete Loan</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Make a Payment</Text>
            <TextInput
              style={styles.input}
              placeholder="Payment Amount"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
            />
            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOptionButton,
                  paymentOption === 'full' ? styles.selectedOption : null
                ]}
                onPress={() => setPaymentOption('full')}
              >
                <Text style={styles.optionText}>Full Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paymentOptionButton,
                  paymentOption === 'installment' ? styles.selectedOption : null
                ]}
                onPress={() => setPaymentOption('installment')}
              >
                <Text style={styles.optionText}>Installment Plan</Text>
              </TouchableOpacity>
            </View>
            {paymentOption === 'installment' && (
              <View style={styles.installmentContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Number of Installments"
                  value={numberOfInstallments}
                  onChangeText={setNumberOfInstallments}
                  keyboardType="numeric"
                />
                <View style={styles.frequencyOptions}>
                  <TouchableOpacity
                    style={[
                      styles.frequencyButton,
                      installmentFrequency === 'weekly' ? styles.selectedFrequency : null
                    ]}
                    onPress={() => setInstallmentFrequency('weekly')}
                  >
                    <Text style={styles.frequencyText}>Weekly</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.frequencyButton,
                      installmentFrequency === 'monthly' ? styles.selectedFrequency : null
                    ]}
                    onPress={() => setInstallmentFrequency('monthly')}
                  >
                    <Text style={styles.frequencyText}>Monthly</Text>
                  </TouchableOpacity>
                </View>
                {paymentAmount && numberOfInstallments ? (
                  <Text style={styles.installmentCalculation}>
                    Each installment: LKR:{(parseFloat(paymentAmount) / parseInt(numberOfInstallments)).toFixed(2)}
                  </Text>
                ) : null}
                {installmentFrequency === 'weekly' && (
                  <View style={styles.sameWeekContainer}>
                    <Text style={styles.sameWeekLabel}>Payments this week:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Number of payments"
                      value={sameWeekPayments.toString()}
                      onChangeText={(text) => setSameWeekPayments(parseInt(text) || 1)}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              </View>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setPaymentAmount('');
                  setPaymentOption('full');
                  setNumberOfInstallments('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handlePayment}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Installment Plan Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editInstallmentModalVisible}
        onRequestClose={() => setEditInstallmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Installment Plan</Text>
            <TextInput
              style={styles.input}
              placeholder="Total Amount"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Number of Installments"
              value={numberOfInstallments}
              onChangeText={setNumberOfInstallments}
              keyboardType="numeric"
            />
            <View style={styles.frequencyOptions}>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  installmentFrequency === 'weekly' ? styles.selectedFrequency : null
                ]}
                onPress={() => setInstallmentFrequency('weekly')}
              >
                <Text style={styles.frequencyText}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  installmentFrequency === 'monthly' ? styles.selectedFrequency : null
                ]}
                onPress={() => setInstallmentFrequency('monthly')}
              >
                <Text style={styles.frequencyText}>Monthly</Text>
              </TouchableOpacity>
            </View>
            {paymentAmount && numberOfInstallments && (
              <Text style={styles.installmentCalculation}>
                Each installment: LKR:{(parseFloat(paymentAmount) / parseInt(numberOfInstallments)).toFixed(2)}
              </Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditInstallmentModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateInstallmentPlan}
              >
                <Text style={styles.modalButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editPaymentModalVisible}
        onRequestClose={() => setEditPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Installment Payment</Text>
            <TextInput
              style={styles.input}
              placeholder="Payment Amount"
              value={additionalPaymentAmount}
              onChangeText={setAdditionalPaymentAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEditPaymentModalVisible(false);
                  setAdditionalPaymentAmount('');
                  setSelectedPayment(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdatePayment}
              >
                <Text style={styles.modalButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  borrowerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paidOffText: {
    color: '#4CAF50',
  },
  paidOffBadge: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
  },
  paidOffBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 12,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  progressText: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  paymentDate: {
    fontSize: 16,
    color: '#333',
  },
  installmentNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
  },
  noPaymentsText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 24,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  paymentButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  paymentOptionButton: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  optionText: {
    color: '#333',
    fontWeight: '500',
  },
  installmentContainer: {
    marginTop: 8,
  },
  frequencyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  frequencyButton: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  selectedFrequency: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  frequencyText: {
    color: '#333',
  },
  installmentCalculation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
  paymentRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletePaymentButton: {
    marginLeft: 10,
    padding: 5,
  },
  deletePaymentText: {
    color: '#F44336',
    fontSize: 14,
  },
  sameWeekContainer: {
    marginTop: 10,
  },
  sameWeekLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoanDetailScreen;