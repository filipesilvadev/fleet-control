import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';

export default function ConvoyRefuelingScreen() {
  const [formData, setFormData] = useState({
    convoyId: '',
    capacity: '',
    date: new Date(),
    currentLevel: '',
    refillAmount: '',
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await firestore().collection('convoy_refuelings').add({
        ...formData,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      // Atualizar estoque
      const stockRef = firestore().collection('stock').doc('current');
      await firestore().runTransaction(async transaction => {
        const stock = await transaction.get(stockRef);
        const newLevel = (stock.data()?.level || 0) - parseFloat(formData.refillAmount);
        transaction.update(stockRef, { level: newLevel });
      });

      setFormData({
        convoyId: '',
        capacity: '',
        date: new Date(),
        currentLevel: '',
        refillAmount: '',
      });

    } catch (error) {
      console.error(error);
      alert('Erro ao registrar abastecimento do comboio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="ID do Comboio"
            value={formData.convoyId}
            onChangeText={(text) => setFormData(prev => ({ ...prev, convoyId: text }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Capacidade Total (L)"
            value={formData.capacity}
            onChangeText={(text) => setFormData(prev => ({ ...prev, capacity: text }))}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Button 
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.input}
          >
            {formData.date.toLocaleDateString()}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setFormData(prev => ({ ...prev, date }));
                }
              }}
            />
          )}

          <TextInput
            label="Nível Atual (L)"
            value={formData.currentLevel}
            onChangeText={(text) => setFormData(prev => ({ ...prev, currentLevel: text }))}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Quantidade para Reabastecimento (L)"
            value={formData.refillAmount}
            onChangeText={(text) => setFormData(prev => ({ ...prev, refillAmount: text }))}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Button 
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          >
            Registrar Abastecimento do Comboio
          </Button>
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
  card: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 10,
  },
});