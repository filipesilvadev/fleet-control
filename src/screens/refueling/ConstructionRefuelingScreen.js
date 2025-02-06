import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';

export default function ConstructionRefuelingScreen() {
  const [formData, setFormData] = useState({
    date: new Date(),
    machineId: '',
    hourmeter: '',
    operator: '',
    liters: '',
    constructionSite: ''
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await firestore().collection('construction_refuelings').add({
        ...formData,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      // Atualizar estoque
      const stockRef = firestore().collection('stock').doc('current');
      await firestore().runTransaction(async transaction => {
        const stock = await transaction.get(stockRef);
        const newLevel = (stock.data()?.level || 0) - parseFloat(formData.liters);
        transaction.update(stockRef, { level: newLevel });
      });

      setFormData({
        date: new Date(),
        machineId: '',
        hourmeter: '',
        operator: '',
        liters: '',
        constructionSite: ''
      });

    } catch (error) {
      console.error(error);
      alert('Erro ao registrar abastecimento na obra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
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
            label="ID da Máquina"
            value={formData.machineId}
            onChangeText={(text) => setFormData(prev => ({ ...prev, machineId: text }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Horímetro"
            value={formData.hourmeter}
            onChangeText={(text) => setFormData(prev => ({ ...prev, hourmeter: text }))}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Operador"
            value={formData.operator}
            onChangeText={(text) => setFormData(prev => ({ ...prev, operator: text }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Litros Abastecidos"
            value={formData.liters}
            onChangeText={(text) => setFormData(prev => ({ ...prev, liters: text }))}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Local da Obra"
            value={formData.constructionSite}
            onChangeText={(text) => setFormData(prev => ({ ...prev, constructionSite: text }))}
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
            Registrar Abastecimento
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