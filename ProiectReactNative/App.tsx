// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from './screens/RegisterSCreen';
import LoginScreen from './screens/LoginScreen';
import UserDetailsScreen from './screens/UserDetailsScreen';
import LobbyScreen from './screens/LobbyScreen';
import JoinGameScreen from './screens/JoinGameScreen';
import GameScreen from './screens/GameScreen';
import ConfigureTableScreen from './screens/ConfigureTableScreen'; 
import LiveGamesScreen from './screens/LiveGamesScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Register">
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="JoinGame" component={JoinGameScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="ConfigureTable" component={ConfigureTableScreen} />
        <Stack.Screen name="LiveGames" component={LiveGamesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
