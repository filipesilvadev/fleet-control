// src/screens/stock/StockControlScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, ProgressBar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

export default function StockControlScreen() {
  const [stockLevel, setStockLevel] = useState(0);
  const [tankCapacity, setTankCapacity] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    // Carregar configurações do tanque
    const loadTankConfig = async () => {
      const tankDoc = await firestore()
        .collection('settings')
        .doc('tank')
        .get();
      
      if (tankDoc.exists) {
        setTankCapacity(tankDoc.data().capacity || 0);
      }
    };

    // Carregar nível atual do estoque
    const loadCurrentStock = async () => {
      const stockDoc = await firestore()
        .collection('stock')
        .doc('current')
        .get();
      
      if (stockDoc.exists) {
        setStockLevel(stockDoc.data().level || 0);
      }
    };

    // Carregar transações recentes
    const loadRecentTransactions = async () => {
      const transactions = await firestore()
        .collection('transactions')
        .orderBy('date', 'desc')
        .limit(5)
        .get();

      setRecentTransactions(
        transactions.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    };

    loadTankConfig();
    loadCurrentStock();
    loadRecentTransactions();
  }, []);

  const stockPercentage = tankCapacity > 0 ? stockLevel / tankCapacity : 0;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.stockCard}>
        <Card.Content>
          <Title>Nível do Tanque</Title>
          <ProgressBar progress={stockPercentage} color="#2196F3" style={styles.progressBar} />
          <Paragraph>{`${stockLevel.toFixed(2)} litros de ${tankCapacity} litros`}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title>Ações</Title>
          <Button 
            mode="contained" 
            onPress={() => {/* TODO: Implementar adição de nota fiscal */}}
            style={styles.button}
          >
            Adicionar Nota Fiscal
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => {/* TODO: Implementar visualização de histórico */}}
            style={styles.button}
          >
            Ver Histórico Completo
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.transactionsCard}>
        <Card.Content>
          <Title>Transações Recentes</Title>
          {recentTransactions.map(transaction => (
            <View key={transaction.id} style={styles.transaction}>
              <Paragraph>{new Date(transaction.date).toLocaleDateString()}</Paragraph>
              <Paragraph>{`${transaction.type === 'in' ? '+' : '-'} ${transaction.amount} L`}</Paragraph>
              <Paragraph>{transaction.description}</Paragraph>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  stockCard: {
    marginBottom: 10,
  },
  actionsCard: {
    marginBottom: 10,
  },
  transactionsCard: {
    marginBottom: 10,
  },
  progressBar: {
    height: 20,
    marginVertical: 10,
  },
  button: {
    marginVertical: 5,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});