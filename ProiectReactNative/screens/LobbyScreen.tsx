import React, { useCallback, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const LobbyScreen = ({ navigation }: any) => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get('http://163.172.177.98:8081/game', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const createdGames = response.data.games.filter((game: any) => game.status === 'CREATED');
      setGames(createdGames);
      setError(null);
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to load games.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGames();
    }, [])
  );

  const createGame = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.post('http://163.172.177.98:8081/game', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert('Game Created', `Game ID: ${response.data.id}`);
      navigation.navigate('Game', { gameId: response.data.id }); 
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert('Failed to create game.');
    }
  };

  const joinGame = async (gameId: string) => {
    try {
      console.log(gameId);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

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
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <>
          <View style={styles.buttonSpacing}>
          <Button title="Create Game" onPress={createGame} />
        </View>
        <View style={styles.buttonSpacing}>
          <Button title="Join Game By ID" onPress={() => navigation.navigate('JoinGame')} />
        </View>
          <FlatList
            data={games}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.gameItem}>
                <Text>Game ID: {item.id}</Text>
                <Text>Status: {item.status}</Text>
                <Button title="Join Game" onPress={() => joinGame(item.id)} />
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  gameItem: {
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  buttonSpacing:{
    padding: 5
  }
});

export default LobbyScreen;
