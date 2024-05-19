import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JoinGameScreen = ({ navigation }: any) => {
  const [gameId, setGameId] = useState('');

  const handleJoinGame = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`http://163.172.177.98:8081/game/join/${gameId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert('Game Joined', `You have joined game ID: ${response.data.id}`);
      navigation.navigate('Game', { gameId: response.data.id }); 
    } catch (error) {
      console.error('Error joining game:', error);
      Alert.alert('Failed to join game.', 'Please check the game ID and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Game ID to Join:</Text>
      <TextInput
        style={styles.input}
        value={gameId}
        onChangeText={setGameId}
        placeholder="Enter Game ID"
      />
      <Button title="Join Game" onPress={handleJoinGame} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  label: {
    marginVertical: 8,
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
});

export default JoinGameScreen;
