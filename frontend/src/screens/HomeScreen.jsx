import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/animations/colorful-background.json')}
        autoPlay
        loop
        style={styles.background}
      />
      <Animatable.View animation="fadeIn" style={styles.content}>
        <Animatable.Text animation="bounceIn" style={styles.text}>
          Welcome to the Reading Learning App!
        </Animatable.Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Record')}
        >
          <Animatable.Image
            animation="pulse"
            iterationCount="infinite"
            style={styles.icon}
            source={require('../../assets/images/microphone.png')}
          />
          <Text style={styles.buttonText}>Record</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Vocabulary')}
        >
          <Animatable.Image
            animation="pulse"
            iterationCount="infinite"
            style={styles.icon}
            source={require('../../assets/images/word.png')}
          />
          <Text style={styles.buttonText}>Learn Words</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Pronunciation')}
        >
          <Animatable.Image
            animation="pulse"
            iterationCount="infinite"
            style={styles.icon}
            source={require('../../assets/images/document.png')}
          />
          <Text style={styles.buttonText}>Pronunciation</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: Dimensions.get('window').width, // Ensure the background covers the full width
    height: Dimensions.get('window').height,
    zIndex: -1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    padding: 10,
    margin: 10,
    borderRadius: 20,
    width: 250,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  icon: {
    width: 40,
    height: 40,
  },
});

export default HomeScreen;
