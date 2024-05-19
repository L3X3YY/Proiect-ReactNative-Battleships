import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserDetailsScreen = ({ navigation }: any) => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('http://163.172.177.98:8081/user/details/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setUserDetails(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      Alert.alert('Logged out', 'You have been logged out.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Logout Failed', 'An error occurred while logging out.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userDetails ? (
        <>
          <Text style={styles.label}>Email: {userDetails.user.email}</Text>
          <Text style={styles.label}>ID: {userDetails.user.id}</Text>
          <Text style={styles.label}>Games Played: {userDetails.gamesPlayed}</Text>
          <Text style={styles.label}>Games Won: {userDetails.gamesWon}</Text>
          <Text style={styles.label}>Games Lost: {userDetails.gamesLost}</Text>
          <Text style={styles.label}>Live Games: {userDetails.currentlyGamesPlaying}</Text>
          <View style={styles.buttonContainer}>
            <Button title="Public Games" onPress={() => navigation.navigate('Lobby')} />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="My Games" onPress={() => navigation.navigate('LiveGames')} />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Logout" onPress={handleLogout} />
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>No user details available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  label: {
    fontSize: 18,
    marginVertical: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  buttonContainer: {
    marginVertical: 8,
  },
});

export default UserDetailsScreen;
