import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const shipSizes = [2, 3, 4, 6];
const directions = ["HORIZONTAL", "VERTICAL"];
const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const ConfigureTableScreen = ({ route, navigation }: any) => {
  const { gameId } = route.params;
  const [ships, setShips] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<number>(shipSizes[0]);
  const [selectedDirection, setSelectedDirection] = useState<string>(directions[0]);
  const [selectedRow, setSelectedRow] = useState<string>(rows[0]);
  const [selectedColumn, setSelectedColumn] = useState<number>(columns[0]);

  const addShip = () => {
    const newShip = {
      x: selectedRow,
      y: selectedColumn,
      size: selectedSize,
      direction: selectedDirection,
    };
    setShips([...ships, newShip]);
  };

  const removeShip = (index: number) => {
    const updatedShips = ships.filter((_, i) => i !== index);
    setShips(updatedShips);
  };

  const sendConfiguration = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      // Validate the ships before sending
      const isValid = ships.every(ship => {
        const { x, y, size, direction } = ship;
        return (
          rows.includes(x) &&
          columns.includes(y) &&
          shipSizes.includes(size) &&
          directions.includes(direction)
        );
      });

      if (!isValid) {
        throw new Error('Invalid ship configuration');
      }

      const response = await axios.patch(`http://163.172.177.98:8081/game/${gameId}`, { ships }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        Alert.alert('Configuration Sent', 'Your ship configuration has been sent.');
        navigation.goBack();
      } else {
        throw new Error('Failed to send configuration');
      }
    } catch (error: any) {
      console.error('Error sending configuration:', error.response ? error.response.data : error.message);
      Alert.alert('Failed to send configuration.', error.response ? error.response.data.message : 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Ship Size:</Text>
      <Picker
        selectedValue={selectedSize}
        onValueChange={(itemValue: number) => setSelectedSize(itemValue)}
      >
        {shipSizes.map((size) => (
          <Picker.Item key={size} label={size.toString()} value={size} />
        ))}
      </Picker>
      <Text style={styles.label}>Select Direction:</Text>
      <Picker
        selectedValue={selectedDirection}
        onValueChange={(itemValue: string) => setSelectedDirection(itemValue)}
      >
        {directions.map((direction) => (
          <Picker.Item key={direction} label={direction} value={direction} />
        ))}
      </Picker>
      <Text style={styles.label}>Select Position:</Text>
      <Picker
        selectedValue={selectedRow}
        onValueChange={(itemValue: string) => setSelectedRow(itemValue)}
      >
        {rows.map((row) => (
          <Picker.Item key={row} label={row} value={row} />
        ))}
      </Picker>
      <Picker
        selectedValue={selectedColumn}
        onValueChange={(itemValue: number) => setSelectedColumn(itemValue)}
      >
        {columns.map((col) => (
          <Picker.Item key={col} label={col.toString()} value={col} />
        ))}
      </Picker>
      <Button title="Add Ship" onPress={addShip} />
      <FlatList
        data={ships}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.shipItem}>
            <Text>{`Ship of size ${item.size} at ${item.x}${item.y} facing ${item.direction}`}</Text>
            <TouchableOpacity style={styles.removeButton} onPress={() => removeShip(index)}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Send Configuration" onPress={sendConfiguration} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  shipItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  removeButton: {
    backgroundColor: '#ff0000',
    padding: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
});

export default ConfigureTableScreen;
