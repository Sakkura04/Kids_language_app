import React from 'react';
import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MD2DarkTheme, Provider as PaperProvider } from 'react-native-paper';
import { View, Text, Platform, TouchableOpacity } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import RecordScreen from './screens/RecordScreen';
import ResultsScreen from './screens/ResultScreen';
import VocabularyScreen from './screens/VocabularyScreen';
import PronunciationScreen from './screens/PronunciationScreen';
import TransitionScreen from './screens/TransitionScreen';
import OpeningScreen from './screens/OpeningScreen';
import BookScreen from './screens/BookScreen';

const Stack = createNativeStackNavigator();

const HEADER_HEIGHT = 70;

function CustomHeader() {
  const navigation = useNavigation();
  const route = useRoute();
  let headerText = 'HOME';
  if (route.name === 'Vocabulary') headerText = 'VOCABULARY';
  if (route.name === 'Pronunciation') headerText = 'PRONUNCIATION';
  if (route.name === 'Results') headerText = 'ANALYSIS';
  if (route.name === 'Record') headerText = 'RECORDING';
  // You can add more conditions for other screens if needed
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.replace('Home')}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: HEADER_HEIGHT,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        // overflow: 'h   
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#3686B7',
          letterSpacing: 2,
          fontFamily: Platform.OS === 'ios' ? 'MarkerFelt-Wide' : 'sans-serif-medium',
          marginTop: Platform.OS === 'ios' ? 18 : 10,
        }}
      >
        {headerText}
      </Text>
    </TouchableOpacity>
  );
}

const App = () => {
  return (
    <PaperProvider theme={MD2DarkTheme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
          <Stack.Screen name="Opening" component={OpeningScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Record" component={RecordScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="Vocabulary" component={VocabularyScreen} />
          <Stack.Screen name="Pronunciation" component={PronunciationScreen} />
          <Stack.Screen name="Book" component={BookScreen} />
          <Stack.Screen name="Transition" component={TransitionScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
