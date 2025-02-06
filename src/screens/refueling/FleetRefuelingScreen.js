import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

export default function FleetRefuelingScreen() {
  const [formData, setFormData] = useState({
    plate: '',
    date: new Date(),
    fuelType: 'diesel',
    odometer: '',
    driver: '',
    liters: '',
    receiptImage: null,
    panelImage: null
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleImagePick = async (type) => {
    const result = await ImagePicker.launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (!result.didCancel && result.assets?.[0]) {
      setFormData(prev => ({
        ...prev,
        [type]: result.assets[0].uri
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Upload das imagens
      const uploadImage = async (uri, path) => {
        if (!uri) return null;
        const reference = storage().ref(path);
        await reference.putFile(uri);
        return await reference.getDownloadURL();
      };

      const receiptUrl = await uploadImage(
        formData.receiptImage,
        `refueling/receipts/${formData.plate}_${Date.now()}`
      );

      const panelUrl = await uploadImage(
        formData.panelImage,
        `refueling/panels/${formData.plate}_${Date.now()}`
      );

      // Salvar no Firestore
      await firestore().collection('refuelings').add({
        ...formData,
        receiptImage: receiptUrl,
        panelImage: panelUrl,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      // Atualizar estoque
      const stockRef = firestore().collection('stock').doc('current');
      await firestore().runTransaction(async transaction => {
        const stock = await transaction.get(stockRef);
        const newLevel = (stock.data()?.level || 0) - parseFloat(formData.liters);
        transaction.update(stockRef, { level: newLevel });
      });

      // Limpar formulário
      setFormData({
        plate: '',
        date: new Date(),
        fuelType: 'diesel',
        odometer: '',
        driver: '',
        liters: '',
        receiptImage: null,
        panelImage: null
      });

    } catch (error) {
      console.error(error);
      alert('Erro ao registrar abastecimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Placa do Veículo"
            value={formData.plate}
            onChangeText={(text) => setFormData(prev => ({ ...prev, plate: text }))}
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

          <SegmentedButtons
            value={formData.fuelType}
            onValueChange={value => 
              setFormData(prev => ({ ...prev, fuelType: value }))
            }
            buttons={[
              { value: 'diesel', label: 'Diesel' },
              { value: 'arla', label: 'Arla' },
            ]}
            style={styles.input}
          />

          <TextInput
            label="Hodômetro (km)"
            value={formData.odometer}
            onChangeText={(text) => setFormData(prev => ({ ...prev, odometer: text }))}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Motorista"
            value={formData.driver}
            onChangeText={(text) => setFormData(prev => ({ ...prev, driver: text }))}
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

          <Button 
            mode="outlined"
            onPress={() => handleImagePick('receiptImage')}
            style={styles.input}
            icon={formData.receiptImage ? 'check' : 'camera'}
          >
            {formData.receiptImage ? 'Cupom Fiscal Anexado' : 'Anexar Cupom Fiscal'}
          </Button>

          <Button 
            mode="outlined"
            onPress={() => handleImagePick('panelImage')}
            style={styles.input}
            icon={formData.panelImage ? 'check' : 'camera'}
          >
            {formData.panelImage ? 'Foto do Painel Anexada' : 'Anexar Foto do Painel'}
          </Button>

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