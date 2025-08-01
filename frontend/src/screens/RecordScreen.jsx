import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, SafeAreaView, Platform, Alert, Animated, PanResponder, Dimensions } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioRecorderComponent from '../components/AudioRecorder';

const paragraphs = [
  "Once upon a time, in a land far away, there lived a young princess who loved to explore the forests around her castle. She would spend hours wandering among the trees, listening to the birds sing and watching the squirrels play.",
  "One sunny day, she found a small, sparkling stone on the ground. Curious, she picked it up and held it to the light. The stone began to glow, and suddenly, a tiny fairy appeared before her, thanking her for finding the lost magical gem.",
  "The princess and the fairy became friends, and together they embarked on many adventures, discovering hidden treasures and learning the secrets of the enchanted forest."
];

const { width, height } = Dimensions.get('window');
const MENU_CLOSED_Y = 45;
const MENU_HEIGHT = height * 0.51;
const MENU_ITEMS = [
  { label: 'Home', screen: 'Home' },
  { label: 'Results', screen: 'Results' },
  { label: 'Record', screen: 'Record' },
  { label: 'Vocabulary', screen: 'Vocabulary' },
  { label: 'Pronunciation', screen: 'Pronunciation' },
];

const RecordScreen = ({ navigation, route }) => {
  console.log("RecordScreen called");
  const bookId = route?.params?.book_id || 1; // Get book_id from navigation params, default to 1
  const [fragmentId, setFragmentId] = useState(1); // Start from fragment 1
  const [fragment, setFragment] = useState({ fragment_id: 1, chapter_name: '', text: '' });
  const [maxFragmentId, setMaxFragmentId] = useState(null); // To be set after fetch
  const [minFragmentId, setMinFragmentId] = useState(null); // To be set after fetch
  const [streak] = useState(5); // Example streak
  const [isRecording, setIsRecording] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordPath, setRecordPath] = useState('');
  const [backendWords, setBackendWords] = useState([]); // Store fetched words

  // Pull-up menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const translateY = useRef(new Animated.Value(MENU_HEIGHT - MENU_CLOSED_Y)).current;

  // Animated background color for menu
  const bgColor = translateY.interpolate({
    inputRange: [0, MENU_HEIGHT - MENU_CLOSED_Y],
    outputRange: ['#3686B7', '#fff'],
  });

  // Animate menu open/close
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

  // PanResponder for drag
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

  // Setup record path
  useEffect(() => {
    const tempPath = Platform.select({
      ios: `${RNFS.CachesDirectoryPath}/recorded.m4a`,
      android: `${RNFS.CachesDirectoryPath}/recorded.mp4`,
    });
    setRecordPath(tempPath);
  }, []);

  // Fetch max fragmentId for the current book
  useEffect(() => {
    fetch('http://134.190.225.163:5000/get-min-max-fragment-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: bookId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.max_fragment_id) {
          setMaxFragmentId(data.max_fragment_id);
        }
        if (data && data.min_fragment_id) {
          setMinFragmentId(data.min_fragment_id);
        }
      })
      .catch((error) => {
        console.error('Error fetching max fragment id:', error);
      });
  }, [bookId]);

  // Fetch fragment by ID
  useEffect(() => {
    fetch('http://134.190.225.163:5000/get-reading-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fragment_id: fragmentId, book_id: bookId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.text) {
          setFragment(data);
        }
      })
      .catch((error) => {
        console.error('Error fetching fragment:', error);
      });
  }, [fragmentId, bookId]);

  // Permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Start recording
  const onStartRecord = async () => {
    Alert.alert('Debug', 'Start pressed');
    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) {
      Alert.alert('Permission Denied', 'Cannot record without microphone permission.');
      return;
    }
    try {
      await audioRecorderPlayer.startRecorder(recordPath);
      audioRecorderPlayer.addRecordBackListener(() => {});
      setIsRecording(true);
      setIsRecorded(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  // Stop recording
  const onStopRecord = async () => {
    console.log("onStopRecord called");
    try {
      await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setIsRecorded(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  // Play recording
  const onPlayRecordedAudio = async () => {
    console.log("onPlayRecordedAudio called");
    if (!isRecorded) return;
    try {
      setIsPlaying(true);
      await audioRecorderPlayer.startPlayer(recordPath);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.current_position === e.duration) {
          audioRecorderPlayer.stopPlayer();
          setIsPlaying(false);
        }
      });
    } catch (e) {
      setIsPlaying(false);
      Alert.alert('Error', 'Failed to play recording.');
    }
  };

  // Send recording
  const onSendRecording = async () => {
    console.log("onSendRecording called");
    try {
      const exists = await RNFS.exists(recordPath);
      if (!exists) {
        Alert.alert('No Recording', 'Please record first.');
        return;
      }
      const audioBase64 = await RNFS.readFile(recordPath, 'base64');
      // Send audioBase64 and currentParagraph to backend
      const response = await fetch('http://134.190.225.163:5000/process-recorded-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: audioBase64,
          displayed_text: fragment.text,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', 'Recording sent and processed!');
        // Optionally handle data here
      } else {
        Alert.alert('Error', 'Failed to process recording.');
      }
      setIsRecorded(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to send recording.');
    }
  };

  // Discard recording
  const onDiscardRecording = async () => {
    try {
      const exists = await RNFS.exists(recordPath);
      if (exists) {
        await RNFS.unlink(recordPath);
      }
      setIsRecorded(false);
      setIsPlaying(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to discard recording.');
    }
  };

  const handleRecordingComplete = (path) => {
    setRecordPath(path);
    setIsRecorded(true);
    setIsRecording(false);
  };

  // Next/Back handlers
  const handleNext = () => {
    if (fragmentId + minFragmentId - 1 >= maxFragmentId) return;
    setFragmentId((prev) => prev + 1);
  };
  
  
  const handleBack = () => {
    if (fragmentId <= 1) return;
    setFragmentId((prev) => prev - 1);
  };

  // Load saved fragment state when component mounts
  useEffect(() => {
    const loadSavedFragment = async () => {
      try {
        const savedFragmentId = await AsyncStorage.getItem(`book_${bookId}_fragment`);
        if (savedFragmentId) {
          setFragmentId(parseInt(savedFragmentId));
        }
      } catch (error) {
        console.error('Error loading saved fragment:', error);
      }
    };
    loadSavedFragment();
  }, [bookId]);

  // Save fragment state when leaving the screen
  useEffect(() => {
    const saveFragmentState = async () => {
      try {
        await AsyncStorage.setItem(`book_${bookId}_fragment`, fragmentId.toString());
      } catch (error) {
        console.error('Error saving fragment state:', error);
      }
    };

    // Save when component unmounts
    return () => {
      saveFragmentState();
    };
  }, [fragmentId, bookId]);

  // Save fragment state when fragmentId changes
  useEffect(() => {
    const saveFragmentState = async () => {
      try {
        await AsyncStorage.setItem(`book_${bookId}_fragment`, fragmentId.toString());
      } catch (error) {
        console.error('Error saving fragment state:', error);
      }
    };
    saveFragmentState();
  }, [fragmentId, bookId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ImageBackground
        source={require('../../assets/images/sky.jpeg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        {/* Streak line */}
        <View style={styles.streakContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../../assets/images/streak.png')} style={styles.streakIcon} resizeMode="contain" />
            <Text style={styles.streakText}>Streak: <Text style={styles.streakNumber}>{streak}</Text></Text>
          </View>
        </View>
        {/* White frame with transparent center */}
        <View style={styles.frame}>
          {/* Inner half-transparent rounded rectangle */}
          <View style={styles.innerCard}>
            {/* Pill buttons - redesigned */}
            <View style={styles.pillRowCustom}>
                <TouchableOpacity
                style={styles.pillNavButton}
                onPress={handleBack}
                disabled={fragmentId <= 1}
                >
                <Text style={styles.pillNavButtonText}>BACK</Text>
                </TouchableOpacity>
              <View style={styles.pillCenterTextContainer}>
                <Text style={styles.pillCenterText}>READ THE TEXT</Text>
              </View>
              <TouchableOpacity
                style={styles.pillNavButton}
                onPress={handleNext}
                disabled={fragmentId + minFragmentId - 1 >= maxFragmentId}
              >
                <Text style={styles.pillNavButtonText}>NEXT</Text>
              </TouchableOpacity>
            </View>
            {/* Paragraph */}
            <View style={styles.textContainer}>
              <Text style={styles.paragraphText}>{fragment.text}</Text>
            </View>
            {/* Bird image - stick to right side of innerCard */}
            <Image source={require('../../assets/images/pronuncuationscreen.png')} style={styles.birdImageStick} resizeMode="contain" />
          </View>
          {/* Bottom buttons */}
          <View style={styles.buttonRow}>
        <AudioRecorderComponent
          onRecordingComplete={handleRecordingComplete}
          currentText={fragment.text}
            />

            {isRecorded && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.playButton]}
                  onPress={onPlayRecordedAudio}
                >
                  <Text style={styles.actionButtonText}>Play</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.sendButton]}
                  onPress={onSendRecording}
                >
                  <Text style={styles.actionButtonText}>Send</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.discardButton]}
                  onPress={onDiscardRecording}
                >
                  <Text style={styles.actionButtonText}>Discard</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ImageBackground>
      {/* Pull-up menu handle */}
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
      {/* Pull-up menu */}
      <Animated.View
        style={[
          styles.menuContainer,
          { transform: [{ translateY }], backgroundColor: bgColor },
        ]}
        pointerEvents={menuOpen ? 'auto' : 'none'}
        {...panResponder.panHandlers}
      >
        <View style={styles.menuDragIndicator} />
        {MENU_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.screen}
            style={[
              styles.menuItem,
              idx === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 }
            ]}
            onPress={() => {
              closeMenu();
              setTimeout(() => navigation.replace(item.screen), 350);
            }}
          >
            <Text style={styles.menuItemText}>{item.label.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </SafeAreaView>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
    zIndex: 0,
  },
  streakContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  streakText: {
    fontFamily: 'PermanentMarker',
    fontSize: 22,
    color: '#3686B7',
    letterSpacing: 1.2,
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  streakNumber: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 24,
  },
  streakIcon: {
    width: 42,
    height: 40,
    marginRight: 0,
  },
  card: {
    // removed, replaced by frame/innerCard
  },
  frame: {
    width: '80%',
    minHeight: '60%',
    borderRadius: 28,
    borderWidth: 5,
    borderColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    marginTop: "2%",
    marginBottom: 15,
  },
  innerCard: {
    width: '95%',
    minHeight: '35%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // half-transparent blue
    borderRadius: 22,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 10,
    position: 'relative',
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 54,
    marginBottom: 12,
    marginTop: 2,
    position: 'relative',
  },
  pillContainer: {
    flexDirection: 'row',
    width: '98%',
    height: 54,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#8DECEF',
    backgroundColor: 'rgba(255, 255, 255, 0.36)', 
    overflow: 'hidden',
    position: 'relative',
  },

  pillActiveBg: {
    position: 'absolute',
    top: -2,
    marginLeft: '75%',
    width: '45%',
    height: '110%',
    backgroundColor: '#8DECEF',
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 1,
    borderTopLeftRadius: 32,
    borderBottomLeftRadius: 32,
  },

  pillButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pillButtonChange: {
    marginLeft: "8%",
  },
  pillText: {
    fontFamily: 'PermanentMarker',
    fontSize: 18,
    color: '#19A7CE',
    fontWeight: 'bold',
    fontStyle: 'italic',
    letterSpacing: 1.2,
  },
  pillTextActive: {
    color: '#19A7CE',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  textContainer: {
    marginVertical: 12,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  paragraphText: {
    fontFamily: 'PermanentMarker',
    fontSize: 20,
    color: '#3686B7',
    textAlign: 'center',
    lineHeight: 28,
  },
  birdContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 8,
  },
  birdImage: {
    width: 110,
    height: 85,
  },
  birdImageStick: {
    position: 'absolute',
    right: -18,
    bottom: -18,
    width: 110,
    height: 85,
    zIndex: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#AEE6FF',
  },
  playButton: {
    backgroundColor: '#4A90E2',
  },
  sendButton: {
    backgroundColor: '#F6ECA9',
  },
  actionButtonText: {
    fontFamily: 'PermanentMarker',
    fontSize: 16,
    color: '#3686B7',
  },
  discardButton: {
    backgroundColor: '#bbb',
  },
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
  pillRowCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '95%',
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.36)',
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#85bfe4',
    marginBottom: 10,
    marginTop: 2,
    overflow: 'hidden',
  },
  pillNavButton: {
    backgroundColor: 'rgba(141,236,239,0.8)',
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 44, 
    minWidth: '20%',
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillNavButtonText: {
    fontFamily: 'PermanentMarker',
    fontSize: 22,
    color: '#19A7CE',
    fontWeight: 'bold',
    fontStyle: 'italic',
    letterSpacing: 1.2,
  },
  pillCenterTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillCenterText: {
    fontFamily: 'PermanentMarker',
    fontSize: 24,
    color: '#19A7CE',
    fontWeight: 'bold',
    fontStyle: 'italic',
    letterSpacing: 1.2,
  },
});

export default RecordScreen;
