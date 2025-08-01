import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Animated, PanResponder, Dimensions, TouchableOpacity, ImageBackground, Image } from 'react-native';
import CustomAudioRecorder from '../components/CustomAudioRecorder.jsx';
import PronunciationFeedbackModal from '../components/PronunciationFeedbackModal.jsx';
import config from '../config';
import { Button } from 'react-native-paper';

const { height } = Dimensions.get('window');
const MENU_CLOSED_Y = 45;
const MENU_HEIGHT = height * 0.51;
const MENU_ITEMS = [
  { label: 'Home', screen: 'Home' },
  { label: 'Results', screen: 'Results' },
  { label: 'Record', screen: 'Record' },
  { label: 'Vocabulary', screen: 'Vocabulary' },
  { label: 'Pronunciation', screen: 'Pronunciation' },
];

const PronunciationScreen = ({ navigation }) => {
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [feedbackData, setFeedbackData] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [segments, setSegments] = useState([]);

    // Pull-up menu state
    const [menuOpen, setMenuOpen] = useState(false);
    const translateY = useRef(new Animated.Value(MENU_HEIGHT - MENU_CLOSED_Y)).current;
    const bgColor = translateY.interpolate({
      inputRange: [0, MENU_HEIGHT - MENU_CLOSED_Y],
      outputRange: ['#3686B7', '#fff'],
    });
    const openMenu = () => {
      setMenuOpen(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: false,
      }).start();
    };
    const closeMenu = () => {
      Animated.timing(translateY, {
        toValue: MENU_HEIGHT - MENU_CLOSED_Y,
        duration: 350,
        useNativeDriver: false,
      }).start(() => setMenuOpen(false));
    };
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dy) > 10;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            const newY = Math.min(gestureState.dy, MENU_HEIGHT - MENU_CLOSED_Y);
            translateY.setValue(newY);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 60) {
            closeMenu();
          } else {
            openMenu();
          }
        },
      })
    ).current;

    useEffect(() => {
        fetchPronunciationWords();
    }, []);

    const fetchPronunciationWords = async () => {
        try {
            const response = await fetch(`${config.backendUrl}/get-pronunciation-words`);
            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }
            const data = await response.json();
            console.log('Received pronunciation words data:', JSON.stringify(data, null, 2));
            const selectedWords = data.words; 
            console.log('Selected words:', JSON.stringify(selectedWords, null, 2));
            setWords(selectedWords);

            // Set initial segments for the first word
            if (selectedWords.length > 0) {
                console.log('First word data:', JSON.stringify(selectedWords[0], null, 2));
                setSegments(selectedWords[0].segments);
            }
        } catch (error) {
            console.error('Error fetching pronunciation words:', error);
            Alert.alert('Error', `Failed to load pronunciation words: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecordingComplete = async (audioBase64) => {
        const currentWord = words[currentIndex];
        if (!currentWord) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${config.backendUrl}/analyze-pronunciation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audio: audioBase64,
                    word: currentWord.word,
                }),
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }

            const responseData = await response.json();
            setFeedbackData(responseData);
            setModalVisible(true);
        } catch (error) {
            console.error('Error analyzing pronunciation:', error);
            Alert.alert('Error', `Failed to analyze pronunciation: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextWord = () => {
        if (currentIndex < words.length - 1) {
            setFeedbackData(null);
            setSegments(words[currentIndex].segments); // Update segments for the next word
            setCurrentIndex(currentIndex + 1);
        } else {
            Alert.alert('Great Job!', 'You have completed all the words.');
            // Optionally, reset or navigate away
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FFA500" />
            </View>
        );
    }

    // const currentWord = words[currentIndex]?.word;
    // const syllables = segments.length > 0 ? segments.join(' - ') : '';
    // const ipa = words[currentIndex]?.ipa || '/ipa/'; // Placeholder, update if available
    const currentWordData = words[currentIndex] || {}; // Отримуємо поточний об'єкт слова або пустий об'єкт, якщо немає
    const currentWord = currentWordData.word || ''; // Текст слова
    const syllables = currentWordData.segments || ''; // Склади через дефіс
    const ipa = currentWordData.ipa || '/ipa/'; // Транскрипція або значення за замовчуванням
    const pronouncedCorrectly = currentWordData.pronounced_correctly || 0; // Рейтинг вимови
    const wordId = currentWordData.id || null; // ID слова з БД

    return (
        <ImageBackground
            source={require('../../assets/images/sky.jpeg')}
            style={styles.background}
            resizeMode="cover"
        >
            {/* Birds and speech bubbles placeholder */}
            <View style={styles.birdsRow}>
                {/* Replace with actual images if available */}
                <Image source={require('../../assets/images/pronunce_blue_bird.png')} style={styles.bird} />
                <Image source={require('../../assets/images/pronunce_red_bird.png')} style={styles.bird} />
            </View>
            {/* Main white frame */}
            <View style={styles.frame}>
                {/* WORD row */}
                <View style={styles.infoLine}>
                    <View style={styles.infoLabelPill}><Text style={styles.infoLabelText}>WORD</Text></View>
                    <Text style={styles.infoLineText}>{currentWord}</Text>
                </View>
                {/* SYLLABLES row */}
                <View style={styles.infoLine}>
                    <View style={styles.infoLabelPill}><Text style={styles.infoLabelText}>SYLLABLES</Text></View>
                    <Text style={styles.infoLineText}>{syllables}</Text>
                </View>
                {/* PRONOUNCE row */}
                <View style={styles.infoLine}>
                    <View style={styles.infoLabelPill}><Text style={styles.infoLabelText}>PRONOUNCE</Text></View>
                    <Text style={styles.infoLineText}>{ipa}</Text>
                </View>
                {/* Buttons row */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.actionButton, styles.startButton]} onPress={() => {}}>
                        <Text style={styles.actionButtonText}>START</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.playButton]} onPress={() => {}}>
                        <Text style={styles.actionButtonText}>PLAY</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.sendButton]} onPress={handleNextWord}>
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>SEND</Text>
                    </TouchableOpacity>

                </View>
            </View>
            {/* Pull-up menu handle and menu remain unchanged */}
            <View style={styles.menuHandleBarContainer} pointerEvents={menuOpen ? 'none' : 'auto'}>
                <View style={styles.menuHandleBar} />
                <View style={styles.menuHandleShort} />
                <TouchableOpacity
                  style={StyleSheet.absoluteFill}
                  activeOpacity={0.7}
                  onPress={openMenu}
                >
                  <View style={{ flex: 1 }} />
                </TouchableOpacity>
            </View>
            <Animated.View
              style={[
                styles.menuContainer,
                { transform: [{ translateY }], backgroundColor: bgColor },
              ]}
              pointerEvents={menuOpen ? 'auto' : 'none'}
              {...panResponder.panHandlers}
            >
              <View style={styles.menuDragIndicator} />
              {/* Menu intentionally left empty on this page */}
            </Animated.View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    birdsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginTop: 30,
        position: 'absolute',
        top: 40,
        left: '40%',
        right: 0,
        zIndex: 100,
    },
    bird: {
        width: 120,
        height: 170,
        marginHorizontal: 10,
        resizeMode: 'contain',
    },
    frame: {
        width: '55%',
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 24,
        borderWidth: 5,
        borderColor: '#fff',
        alignSelf: 'center',
        paddingVertical: '3%',
        paddingHorizontal: '4%',
        marginTop: 80,
        marginBottom: 10,
        alignItems: 'center',
        zIndex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        width: '90%',
        justifyContent: 'space-between',
    },
    labelPill: {
        backgroundColor: '#AEE6FF',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginRight: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    labelText: {
        fontFamily: 'PermanentMarker',
        fontSize: 16,
        color: '#19A7CE',
        fontWeight: 'bold',
        fontStyle: 'italic',
        letterSpacing: 1.2,
    },
    valueText: {
        fontFamily: 'PermanentMarker',
        fontSize: 22,
        color: '#3686B7',
        fontWeight: 'bold',
        letterSpacing: 1.2,
        flexShrink: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '85%',
        height: '15.5%',
        marginTop: 18,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 10,
        borderRadius: 20,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButton: {
        backgroundColor: '#00a0cd',
    },
    playButton: {
        backgroundColor: '#00a0cd',
    },
    sendButton: {
        backgroundColor: '#bcd175',
    },
    actionButtonText: {
        fontFamily: 'PermanentMarker',
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Pull-up menu styles (copied from RecordScreen)
    menuHandleBarContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
      paddingBottom: 8,
      height: 24,
      justifyContent: 'flex-end',
    },
    menuHandleBar: {
      width: '100%',
      height: 10,
      borderRadius: 5,
      backgroundColor: 'rgb(255, 255, 255)',
      position: 'absolute',
      bottom: 0,
      left: 0,
    },
    menuHandleShort: {
      width: 60,
      height: 10,
      borderRadius: 4,
      backgroundColor: '#AEE6FF',
      position: 'absolute',
      bottom: 1,
      left: '50%',
      marginLeft: -30,
    },
    menuContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: MENU_HEIGHT,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      alignItems: 'center',
      paddingTop: 16,
      zIndex: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
      elevation: 8,
    },
    menuDragIndicator: {
      width: 60,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#AEE6FF',
      marginBottom: 10,
    },
    menuItem: {
      width: '80%',
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      alignItems: 'center',
    },
    menuItemText: {
      fontFamily: 'PermanentMarker',
      fontSize: 22,
      color: '#AEE6FF',
      letterSpacing: 1.5,
    },
    infoLine: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        minHeight: '10%',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 36,
        marginBottom: 15,
        paddingHorizontal: 10,
        justifyContent: 'flex-start',
    },
    infoLabelPill: {
        backgroundColor: '#8decef',
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginRight: 12,
        marginLeft: -3,
        minWidth: '25%',
        minHeight: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabelText: {
        color: '#00a0cd',
        fontWeight: 'bold',
        fontSize: 18,
        fontFamily: 'PermanentMarker',
    },
    infoLineText: {
        color: '#48b2d0',
        fontWeight: 'bold',
        fontSize: 18,
        flexShrink: 1,
    },
});

export default PronunciationScreen;
