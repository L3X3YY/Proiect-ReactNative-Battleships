import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LiveGamesScreen = ({ navigation }: any) => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState('ongoing'); // State to manage the filter type

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('http://163.172.177.98:8081/user/details/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserId(response.data.user.id);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchLiveGames = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('http://163.172.177.98:8081/game', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const liveGames = response.data.games.filter((game: any) =>
          (filter === 'ongoing'
            ? ['ACTIVE', 'MAP_CONFIG', 'CREATED'].includes(game.status)
            : game.status === 'FINISHED') &&
          (game.player1Id === userId || game.player2Id === userId)
        );
        setGames(liveGames);
        setError(null);
      } catch (error) {
        console.error('Error fetching live games:', error);
        setError('Failed to load live games.');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveGames();
  }, [userId, filter]); // Add filter as a dependency to refetch games when it changes

  const joinGame = async (gameId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`http://163.172.177.98:8081/game/join/${gameId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert('Game Joined', `You have joined game ID: ${response.data.id}`);
      navigation.navigate('Game', { gameId: response.data.id });
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        // If the error is a 401, navigate to the game screen
        navigation.navigate('Game', { gameId });
      } else {
        console.error('Error joining game:', error);
        Alert.alert('Failed to join game.', 'Please check the game ID and try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Ongoing Games" onPress={() => setFilter('ongoing')} />
        <Button title="History" onPress={() => setFilter('history')} />
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  gameItem: {
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
});

export default LiveGamesScreen;
