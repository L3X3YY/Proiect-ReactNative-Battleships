import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const GameScreen = ({ route, navigation }: any) => {
  const { gameId } = route.params;
  const [gameDetails, setGameDetails] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<string>(rows[0]);
  const [selectedColumn, setSelectedColumn] = useState<number>(columns[0]);

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

  const fetchGameDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`http://163.172.177.98:8081/game/${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.playerToMoveId);
      setGameDetails(response.data);
    } catch (error) {
      console.error('Error fetching game details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserId();
    fetchGameDetails();
  }, [gameId]);

  useFocusEffect(
    React.useCallback(() => {
      const interval = setInterval(fetchGameDetails, 1000);
      return () => clearInterval(interval);
    }, [gameId])
  );

  const handleConfigureTable = () => {
    if (gameDetails && gameDetails.status === "MAP_CONFIG") {
      navigation.navigate('ConfigureTable', { gameId });
    } else {
      Alert.alert('Cannot Configure Table', 'The game must be in MAP_CONFIG state to configure the table.');
    }
  };

  const handleStrike = async () => {
    if (gameDetails.playerToMoveId !== userId) {
      Alert.alert('Not your turn', 'Wait for your turn to make a move.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `http://163.172.177.98:8081/game/strike/${gameId}`,
        { x: selectedRow, y: selectedColumn },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert('Strike Made', `You have struck at ${selectedRow}${selectedColumn}`);
      fetchGameDetails(); // Refresh game details after the strike
    } catch (error) {
      console.error('Error making strike:', error);
      Alert.alert('Failed to make strike.', 'Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderTable = (isUserTable: boolean) => {
    const table = [];

    for (let i = 0; i < rows.length; i++) {
      const row = [];
      for (let j = 0; j < columns.length; j++) {
        const cellId = `${rows[i]}${columns[j]}`;
        let style: any = styles.cell;
        if (isUserTable) {
          const ship = gameDetails?.shipsCoord?.find((shipCoord: any) =>
            shipCoord.x === rows[i] && shipCoord.y === columns[j] && shipCoord.playerId === userId
          );
          const hit = gameDetails?.moves?.find((move: any) =>
            move.x === rows[i] && move.y === columns[j] && move.playerId !== userId
          );
          if (ship) {
            style = [styles.cell, styles.shipCell];
          }
          if (hit) {
            if (hit.result) {
              style = [styles.cell, styles.hitCell];
            } else {
              style = [styles.cell, styles.missedCell];
            }
          }
        } else {
          const hit = gameDetails?.moves?.find((move: any) =>
            move.x === rows[i] && move.y === columns[j] && move.playerId === userId
          );
          if (hit) {
            if (hit.result) {
              style = [styles.cell, styles.hitCell];
            } else {
              style = [styles.cell, styles.missedCell];
            }
          }
        }
        row.push(
          <View key={cellId} style={style}>
            <Text style={styles.cellText}>{cellId}</Text>
          </View>
        );
      }
      table.push(
        <View key={i} style={styles.row}>
          {row}
        </View>
      );
    }

    return table;
  };

  return (
    <View style={styles.container}>
      {gameDetails ? (
        <>
          <Text style={styles.label}>Game ID: {gameDetails.id}</Text>
          <Text style={styles.label}>Status: {gameDetails.status}</Text>
          {gameDetails.status === "FINISHED" ? (
            <Text style={styles.label}>Winner: {gameDetails.playerToMoveId === userId ? 'Opponent' : 'You'}</Text>
          ) : gameDetails.status === "CREATED" ? (
            <Text style={styles.label}>Waiting for a 2nd player...</Text>
          ) : (
            <Text style={styles.label}>Player to Move: {gameDetails.playerToMoveId === userId ? 'You' : 'Opponent'}</Text>
          )}
          
          {gameDetails.status === "MAP_CONFIG" && (
            <Button title="Configure Table" onPress={handleConfigureTable} />
          )}
          {(gameDetails.status === "MAP_CONFIG" || gameDetails.status === "ACTIVE" || gameDetails.status === "FINISHED") && (
            <View style={styles.tableContainer}>
              <View style={styles.table}>{renderTable(true)}</View>
              <View style={styles.table}>{renderTable(false)}</View>
            </View>
          )}
          {gameDetails.status === "ACTIVE" && (
            <View style={styles.pickerContainer}>
              <Text>Select a cell to hit:</Text>
              <Picker
                selectedValue={selectedRow}
                onValueChange={(itemValue: string) => setSelectedRow(itemValue)}
                style={styles.picker}
              >
                {rows.map((row) => (
                  <Picker.Item key={row} label={row} value={row} />
                ))}
              </Picker>
              <Picker
                selectedValue={selectedColumn}
                onValueChange={(itemValue: number) => setSelectedColumn(itemValue)}
                style={styles.picker}
              >
                {columns.map((col) => (
                  <Picker.Item key={col} label={col.toString()} value={col} />
                ))}
              </Picker>
              <Button title="Strike" onPress={handleStrike} />
            </View>
          )}
        </>
      ) : (
        <Text style={styles.errorText}>No game details available.</Text>
      )}
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;
const cellSize = screenWidth / 22; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    marginVertical: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  tableContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  table: {
    marginHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderWidth: .5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 9, 
  },
  shipCell: {
    backgroundColor: '#4CAF50',
  },
  hitCell: {
    backgroundColor: '#FF1000',
  },
  missedCell: {
    backgroundColor: '#253529',
  },
  pickerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  picker: {
    height: 50,
    width: 150,
  },
});

export default GameScreen;
