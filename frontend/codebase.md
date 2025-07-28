
```tsx
/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../src/App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<App />);
});

```

# src\App.jsx

```jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MD2DarkTheme, Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from './screens/HomeScreen';
import RecordScreen from './screens/RecordScreen';
import ResultsScreen from './screens/ResultScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <PaperProvider theme={MD2DarkTheme}>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={{
            tabBarActiveTintColor: '#e91e63',
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Icon name="home" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Record"
            component={RecordScreen}
            options={{
              tabBarLabel: 'Record',
              tabBarIcon: ({ color, size }) => (
                <Icon name="microphone" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Results"
            component={ResultsScreen}
            options={{
              tabBarLabel: 'Results',
              tabBarIcon: ({ color, size }) => (
                <Icon name="chart-bar" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;


# src\styles\globalStyles.js

```js
// globalStyles.js
export default {
    colors: {
      primary: '#FF5722', // Bright, engaging primary color
      accent: '#FFD700', // Warm, inviting accent color
      background: '#FFFFFF', // Light background to make elements pop
      text: '#000000', // High-contrast text for readability
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 20, // Rounded edges for a friendly look
    },
    text: {
      fontSize: 18, // Larger text for readability
    },
  };
  
```

# src\screens\ResultScreen.jsx

```jsx
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ImageBackground, Dimensions } from 'react-native';
import { Card, Title } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';

const ResultsScreen = ({ route }) => {
  const defaultResponseData = {
    transcription: 'N/A',
    readability_metrics: {
      'N/A': {
        'Metric 1': 'N/A',
        'Metric 2': 'N/A',
      },
    },
    word_complexities: {
      'N/A': 'N/A',
    },
    levenshtein_distance: 'N/A',
    missed_keywords: ['N/A'],
    new_keywords: ['N/A'],
  };

  const { responseData = defaultResponseData } = route.params || {};
  const [animate, setAnimate] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setAnimate(true);
      return () => setAnimate(false);
    }, [])
  );

  return (
    <View style={styles.background}>
    
      <LottieView
        source={require('../../assets/animations/colorful-background.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {animate && (
          <>
            <Animatable.View animation="fadeInUp" style={styles.header}>
              <Text style={styles.headerText}>Analysis Results</Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={100} style={styles.cardContainer}>
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.title}>Transcription</Title>
                  <Text style={styles.contentText}>{responseData?.transcription}</Text>
                </Card.Content>
              </Card>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={200} style={styles.cardContainer}>
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.title}>Readability Metrics</Title>
                  {Object.entries(responseData?.readability_metrics).map(([sentence, metrics]) => (
                    <View key={sentence} style={styles.metricContainer}>
                      <Text style={styles.sentence}>{sentence}</Text>
                      {Object.entries(metrics).map(([metric, value]) => (
                        <Text key={metric} style={styles.contentText}>{`${metric}: ${value}`}</Text>
                      ))}
                    </View>
                  ))}
                </Card.Content>
              </Card>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={300} style={styles.cardContainer}>
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.title}>Word Complexities</Title>
                  {Object.entries(responseData?.word_complexities).map(([word, complexity]) => (
                    <Text key={word} style={styles.contentText}>{`${word}: ${complexity}`}</Text>
                  ))}
                </Card.Content>
              </Card>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={400} style={styles.cardContainer}>
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.title}>Additional Information</Title>
                  <Text style={styles.contentText}>Levenshtein Distance: {responseData?.levenshtein_distance}</Text>
                  <Text style={styles.contentText}>Missed Keywords: {responseData?.missed_keywords.join(", ")}</Text>
                  <Text style={styles.contentText}>New Keywords: {responseData?.new_keywords.join(", ")}</Text>
                </Card.Content>
              </Card>
            </Animatable.View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: Dimensions.get('window').width, // Ensure the background covers the full width
    height: Dimensions.get('window').height, // Ensure the background covers the full height
    resizeMode: 'cover',
  },
  lottie: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 80, // To prevent content from being hidden by bottom tabs
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  cardContainer: {
    width: '100%',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  title: {
    fontSize: 22,
    color: '#3143e8',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
  },
  sentence: {
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 5,
  },
  metricContainer: {
    marginBottom: 10,
  },
});

export default ResultsScreen;

```

# src\screens\RecordScreen.jsx

```jsx
import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import SentenceDisplayComponent from '../components/SentenceDisplayComponent'; // Adjust the path as necessary
import AudioRecorderComponent from '../components/AudioRecorder';
import LottieView from 'lottie-react-native';

const RecordScreen = ({ navigation }) => {
  const [audioPath, setAudioPath] = useState('');
  const [currentSentence, setCurrentSentence] = useState('');

  const handleRecordingComplete = (path) => {
    setAudioPath(path);
  };

  return (
    <>
      <LottieView
        source={require('../../assets/animations/confetti.json')} // Adjust the path to your confetti animation file
        autoPlay
        loop
        style={styles.lottie}
        />
      <View style={styles.container}>
        <SentenceDisplayComponent
          currentSentence={currentSentence}
          setCurrentSentence={setCurrentSentence}
          />
        <AudioRecorderComponent
          onRecordingComplete={handleRecordingComplete}
          currentSentence={currentSentence}
          navigation={navigation}
          />
      </View>
          </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: -3,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    resizeMode: 'cover',
    
  },
  lottie: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default RecordScreen;

```

# src\screens\HomeScreen.jsx

```jsx
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
          onPress={() => navigation.navigate('Word')}
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
          onPress={() => navigation.navigate('Documents')}
        >
          <Animatable.Image
            animation="pulse"
            iterationCount="infinite"
            style={styles.icon}
            source={require('../../assets/images/document.png')}
          />
          <Text style={styles.buttonText}>Documents</Text>
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

```

# src\components\SentenceDisplayComponent.jsx

```jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const sentences = [
  "An apple a day keeps the doctor away.",
  "Better late than never.",
  "Actions speak louder than words.",
  "The early bird catches the worm.",
  "The pen is mightier than the sword.",
  "When in Rome, do as the Romans do.",
  "When the going gets tough, the tough get going.",
  "A picture is worth a thousand words.",
  "Don't put all your eggs in one basket.",
  "Don't count your chickens before they hatch.",
  "Don't cry over spilled milk.",
  "Don't bite the hand that feeds you.",
  "Don't judge a book by its cover.",
];
const audioRecorderPlayer = new AudioRecorderPlayer();

const SentenceDisplayComponent = ({ currentSentence, setCurrentSentence }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [wordDetails, setWordDetails] = useState({ 
    phonetics: [], 
    meanings: [], 
    examples: [], 
    antonyms: [] 
  });

  const [wordImage, setWordImage] = useState(null);
  useEffect(() => {
    randomizeSentence();
  }, []);

  const randomizeSentence = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * sentences.length);
    } while (sentences[randomIndex] === currentSentence);
    setCurrentSentence(sentences[randomIndex]);
  };

  
  const fetchWordDetails = async (word) => {
    try {
      const dictionaryApiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
      const linguaRobotApiUrl = `https://lingua-robot.p.rapidapi.com/language/v1/entries/en/${word}`;
  
      let dictionaryData = [];
      let linguaRobotData = {};
  
      // Fetch from Dictionary API
      try {
        const response = await fetch(dictionaryApiUrl);
        dictionaryData = await response.json();
        console.log("Dictionary API response:", dictionaryData);
      } catch (error) {
        console.error("Failed to fetch from Dictionary API:", error);
      }
  
      // Fetch from Lingua Robot API
      try {
        const response = await fetch(linguaRobotApiUrl, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'lingua-robot.p.rapidapi.com',
            'x-rapidapi-key': '511f7ad74dmsh92959ab2bd582fdp105cc0jsne53a5d087da5',
          },
        });
        linguaRobotData = await response.json();
        console.log("Lingua Robot API response:", linguaRobotData);
      } catch (error) {
        console.error("Failed to fetch from Lingua Robot API:", error);
      }
  
      const combinedData = combineApiResponse([dictionaryData, linguaRobotData]);
  
      console.log("Combined API data:", combinedData);
  
      setWordDetails(combinedData);
    } catch (error) {
      console.error("Failed to fetch word details:", error);
    }
  };
  const combineApiResponse = (data) => {
    let phonetics = [];
    let meanings = [];
    let examples = [];
    let antonyms = [];
  
    data.forEach(apiData => {
      if (Array.isArray(apiData) && apiData[0]) {
        // Handling data from Dictionary API
        const dictionaryData = apiData[0];
        console.log("Processing Dictionary API data:", dictionaryData);
  
        if (dictionaryData.phonetics) {
          phonetics = phonetics.concat(dictionaryData.phonetics).slice(0, 2);
        }
  
        if (dictionaryData.meanings) {
          meanings = meanings.concat(dictionaryData.meanings.map(meaning => ({
            partOfSpeech: meaning.partOfSpeech,
            definitions: meaning.definitions ? meaning.definitions.slice(0, 2).map(def => ({
              definition: def.definition,
              example: def.example,
            })) : [],
            antonyms: meaning.antonyms ? meaning.antonyms.slice(0, 2) : [],
          }))).slice(0, 2);
  
          examples = examples.concat(dictionaryData.meanings.flatMap(meaning => meaning.definitions ? meaning.definitions.map(def => def.example).filter(ex => ex) : [])).slice(0, 2);
  
          antonyms = antonyms.concat(dictionaryData.meanings.flatMap(meaning => meaning.antonyms ? meaning.antonyms : [])).slice(0, 2);
        }
      } else if (apiData.entries) {
        // Handling data from Lingua Robot API
        console.log("Processing Lingua Robot API data:", apiData);
        apiData.entries.forEach(entry => {
          if (entry.lexemes) {
            phonetics = phonetics.concat(entry.lexemes.flatMap(lexeme => lexeme.phoneticTranscriptions ? lexeme.phoneticTranscriptions.map(pt => ({ text: pt.transcription, audio: pt.audio.url })) : [])).slice(0, 2);
  
            meanings = meanings.concat(entry.lexemes.map(lexeme => ({
              partOfSpeech: lexeme.partOfSpeech,
              definitions: lexeme.senses ? lexeme.senses.slice(0, 2).map(sense => ({
                definition: sense.definition,
                example: sense.usageExamples ? sense.usageExamples[0] : null,
              })) : [],
              antonyms: lexeme.senses ? lexeme.senses.flatMap(sense => sense.antonyms ? sense.antonyms.slice(0, 2) : []) : [],
            }))).slice(0, 2);
  
            examples = examples.concat(entry.lexemes.flatMap(lexeme => lexeme.senses ? lexeme.senses.flatMap(sense => sense.usageExamples ? sense.usageExamples.slice(0, 2) : []) : [])).slice(0, 2);
  
            antonyms = antonyms.concat(entry.lexemes.flatMap(lexeme => lexeme.senses ? lexeme.senses.flatMap(sense => sense.antonyms ? sense.antonyms.slice(0, 2) : []) : [])).slice(0, 2);
          }
        });
      }
    });
  
    return {
      phonetics: phonetics.slice(0, 2),
      meanings: meanings.slice(0, 2),
      examples: examples.slice(0, 2),
      antonyms: antonyms.slice(0, 2),
    };
  };

  
  const fetchImage = async (word) => {
    const unsplashApiUrl = `https://api.unsplash.com/search/photos?page=1&query=${word}&client_id=2aIcjC6rcF41C9mbzIV-AFsWUdElDp6H4kxoC9pluyM`;

    try {
      const response = await fetch(unsplashApiUrl);
      const jsonData = await response.json();
      console.log("Unsplash API response:", jsonData);

      if (jsonData.results && jsonData.results.length > 0) {
        const imageUrl = jsonData.results[0].urls.small;
        console.log("Image URL:", imageUrl);
        return imageUrl;
      } else {
        console.log("No image found");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch image:", error);
      return null;
    }
  };

  
  const onPlayPronunciation = async (audioUrl) => {
    const msg = await audioRecorderPlayer.startPlayer(audioUrl);
    audioRecorderPlayer.addPlayBackListener((e) => {
      if (e.current_position === e.duration) {
        console.log('finished playing');
        audioRecorderPlayer.stopPlayer();
      }
    });
    console.log(msg);
  };

  const handleWordPress = async (word) => {
    setSelectedWord(word);
    await fetchWordDetails(word); // Assuming this function exists
    const imageUrl = await fetchImage(word);
    setWordImage(imageUrl);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sentenceContainer}>
        {currentSentence.split(" ").map((word, index) => (
          <Text key={index} style={styles.word} onPress={() => handleWordPress(word)}>
            {word + (index < currentSentence.split(" ").length - 1 ? ' ' : '')}
          </Text>
        ))}
      </View>
      <TouchableOpacity onPress={randomizeSentence} style={styles.iconButton}>
        <Icon name="shuffle" size={30} color="white" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.modalTextTitle}>{selectedWord.toUpperCase()}</Text>

            {wordImage && (
              <Image source={{ uri: wordImage }} style={styles.wordImage} />
            )}
            {wordDetails.meanings?.map((meaning, index) => (
              <View key={index} style={styles.meaningContainer}>
                <Text style={styles.modalText}>Part of Speech: {meaning.partOfSpeech}</Text>
                {meaning.definitions?.map((def, idx) => (
                  <View key={idx}>
                    <Text style={styles.definitionText}>Definition: {def.definition}</Text>
                    {def.example && (
                      <Text style={styles.exampleText}>Example: {def.example}</Text>
                    )}
                  </View>
                ))}
                {wordDetails.antonyms?.length > 0 && (
                  <View style={styles.antonymsContainer}>
                    <Text style={styles.modalText}>Antonyms:</Text>
                    <ScrollView horizontal={true}>
                      {wordDetails.antonyms.map((antonym, idx) => (
                        <View key={idx} style={styles.antonymBox}>
                          <Text style={styles.antonymText}>{antonym}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ))}

            {wordDetails.phonetics?.length > 0 && (
              <TouchableOpacity
                style={styles.buttonPlay}
                onPress={() => {
                  onPlayPronunciation(wordDetails.phonetics[0].audio);
                  // this.isButtonDisabled = true; // Disable button after playing once
                }}
                disabled={this.isButtonDisabled}
              >
                <Icon name="volume-up" size={24} color="white" />
                <Text style={styles.textStyle}>Play Pronunciation</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.buttonClose}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.textStyle}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sentenceContainer: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 26,
  },
  wordImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  word: {
    fontSize: 26,
    color: 'black',
    marginRight: 4,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 10,
    backgroundColor: '#6200EE',
    borderRadius: 50,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  scrollView: {
    marginBottom: 10,
  },
  modalTextTitle: {
    marginBottom: 10,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  meaningContainer: {
    marginTop: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  definitionText: {
    marginBottom: 15,
    textAlign: "center",
    color: '#333',
  },
  buttonPlay: {
    marginTop: 10,
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  antonymsContainer: {
    marginTop: 5,
  },
  antonymBox: {
    marginRight: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#e0e0e0', // Light gray background
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  antonymText: {
    color: '#333',
    fontSize: 14,
  },
});

export default SentenceDisplayComponent;

```

# src\components\AudioRecorder.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { View, PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import { Button } from 'react-native-paper';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

const AudioRecorderComponent = ({ currentSentence, navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordPath, setRecordPath] = useState('');
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    const tempPath = Platform.select({
      ios: `${RNFS.CachesDirectoryPath}/hello.m4a`,
      android: `${RNFS.CachesDirectoryPath}/hello.mp4`,
    });
    setRecordPath(tempPath);
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log('Permissions granted:', grants);

        if (
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        } else {
          Alert.alert(
            'Permissions Denied',
            'Microphone permission is denied. Please enable it in the app settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => openSettings() },
            ]
          );
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const onStartRecord = async () => {
    console.log('Starting recording');
    const permissionsGranted = await requestPermissions();
    console.log('Permissions granted:', permissionsGranted);
    if (!permissionsGranted) return;

    const result = await audioRecorderPlayer.startRecorder(recordPath);
    audioRecorderPlayer.addRecordBackListener((e) => {
      console.log('recording', e);
    });
    console.log(result);
    setIsRecording(true);
    setIsReviewMode(false);
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    setIsReviewMode(true);
    console.log(result);
  };

  const onPlayRecordedAudio = async () => {
    try {
      console.log(`Playing audio from: ${recordPath}`);
      await audioRecorderPlayer.stopPlayer(); // Ensure the player is stopped before starting it again
      const msg = await audioRecorderPlayer.startPlayer(recordPath);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.current_position === e.duration) {
          console.log('finished playing');
          audioRecorderPlayer.stopPlayer();
        }
      });
      console.log('Playback message:', msg);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const onSendRecording = async () => {
    try {
      console.log('Checking if file exists at:', recordPath);
      const exists = await RNFS.exists(recordPath);
      if (!exists) {
        console.error('File does not exist:', recordPath);
        return;
      }
  
      console.log('Reading file from path:', recordPath);
      const audioBase64 = await RNFS.readFile(recordPath, 'base64');
      console.log('File read successfully, size:', audioBase64.length);
  
      let dataToSend = {
        audio: audioBase64,
        original_text: currentSentence,
      };
  
      console.log('Sending data to server:', dataToSend);
  
      fetch('http://134.190.163.103:5000/process-audio-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
        .then((response) => {
          console.log('Response status:', response.status);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((responseData) => {
          console.log('Response data:', responseData);
          navigation.navigate('Results', { responseData });
        })
        .catch((error) => {
          console.error('Network request error:', error);
        });
  
      setIsReviewMode(false);
    } catch (error) {
      console.error('Error sending recording:', error);
    }
  };
  

  const onDiscardRecording = async () => {
    try {
      const exists = await RNFS.exists(recordPath);
      if (exists) {
        await RNFS.unlink(recordPath);
        console.log('Temporary recording deleted');
      }
      setIsReviewMode(false);
    } catch (error) {
      console.error('Error discarding recording:', error);
    }
  };

  return (
    <View>
      {!isRecording && !isReviewMode && (
        <Button
          icon="record-circle"
          buttonColor="red"
          textColor="white"
          size={60}
          onPress={onStartRecord}
          style={{ margin: 10 }}
        >
          Start Recording
        </Button>
      )}
      {isRecording && (
        <Button
          icon="stop-circle-outline"
          buttonColor="black"
          size={60}
          onPress={onStopRecord}
          style={{ margin: 10 }}
        >
          Stop Recording
        </Button>
      )}
      {isReviewMode && (
        <>
          <Button
            icon="play-circle-outline"
            buttonColor="green"
            size={60}
            onPress={onPlayRecordedAudio}
            style={{ margin: 10 }}
          >
            Replay Recording
          </Button>
          <Button mode="contained" onPress={onSendRecording} style={{ margin: 10 }}>
            Send
          </Button>
          <Button
            icon="delete-circle-outline"
            buttonColor="grey"
            size={60}
            onPress={onDiscardRecording}
            style={{ margin: 10 }}
          >
            Discard Recording
          </Button>
        </>
      )}
    </View>
  );
};

export default AudioRecorderComponent;

```

# src\api\ApiClient.js

```js
// api/ApiClient.js
const sendRecordingToApi = async (audioPath) => {
    const data = new FormData();
    data.append('audio', {
      uri: audioPath,
      type: 'audio/aac', // Adjust based on actual audio format
      name: 'recording.aac',
    });
  
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        body: data,
      });
      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.error('Error sending recording to API:', error);
      return null;
    }
  };
  
  export { sendRecordingToApi };
  


