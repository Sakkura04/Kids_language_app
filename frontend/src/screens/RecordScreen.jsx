import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SentenceDisplayComponent from '../components/SentenceDisplayComponent';
import AudioRecorderComponent from '../components/AudioRecorder';
import RewardSystemComponent from '../components/RewardSystemComponent';
import LottieView from 'lottie-react-native';

const RecordScreen = ({ navigation }) => {
  const [audioPath, setAudioPath] = useState('');
  const [currentParagraph, setCurrentParagraph] = useState('');
  const [streak, setStreak] = useState(5); // Example streak
  const [rewards, setRewards] = useState([
    { image: require('../../assets/images/star.png') },
    { image: require('../../assets/images/trophy.png') },
    // Add more rewards
  ]);

  const handleRecordingComplete = (path) => {
    setAudioPath(path);
    // Update streak and rewards accordingly
  };

  return (
    <>
      <LottieView
        source={require('../../assets/animations/confetti.json')}
        autoPlay
        loop
        style={styles.lottie}
        />
      <View style={styles.container}>
        <RewardSystemComponent streak={streak} rewards={rewards} />
        <SentenceDisplayComponent
          currentParagraph={currentParagraph}
          setCurrentParagraph={setCurrentParagraph}
          />
        <AudioRecorderComponent
          onRecordingComplete={handleRecordingComplete}
          currentText={currentParagraph}
          navigation={navigation}
          />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
