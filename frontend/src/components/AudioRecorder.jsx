import React, { useState, useEffect } from 'react';
import { View, PermissionsAndroid, Platform, Alert, Linking, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

const AudioRecorderComponent = ({ currentText, navigation }) => {
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
    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) return;

    const result = await audioRecorderPlayer.startRecorder(recordPath);
    audioRecorderPlayer.addRecordBackListener((e) => {
      // Update UI if needed
    });
    setIsRecording(true);
    setIsReviewMode(false);
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    setIsReviewMode(true);
  };

  const onPlayRecordedAudio = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      const msg = await audioRecorderPlayer.startPlayer(recordPath);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.current_position === e.duration) {
          audioRecorderPlayer.stopPlayer();
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const onSendRecording = async () => {
    try {
      const exists = await RNFS.exists(recordPath);
      if (!exists) {
        console.error('File does not exist:', recordPath);
        return;
      }

      const audioBase64 = await RNFS.readFile(recordPath, 'base64');

      let dataToSend = {
        audio: audioBase64,
        original_text: currentText,
      };

      fetch('http://192.168.91.206:5000/process-audio-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((responseData) => {
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
      }
      setIsReviewMode(false);
    } catch (error) {
      console.error('Error discarding recording:', error);
    }
  };

  return (
    <View style={styles.container}>
      {!isRecording && !isReviewMode && (
        <Button
          icon="microphone"
          mode="contained"
          onPress={onStartRecord}
          style={styles.startButton}
          labelStyle={{ fontSize: 18 }}
        >
          Start Recording
        </Button>
      )}
      {isRecording && (
        <Button
          icon="stop"
          mode="contained"
          onPress={onStopRecord}
          style={styles.stopButton}
          labelStyle={{ fontSize: 18 }}
        >
          Stop Recording
        </Button>
      )}
      {isReviewMode && (
        <>
          <Button
            icon="play"
            mode="contained"
            onPress={onPlayRecordedAudio}
            style={styles.playButton}
            labelStyle={{ fontSize: 18 }}
          >
            Replay Recording
          </Button>
          <Button
            icon="send"
            mode="contained"
            onPress={onSendRecording}
            style={styles.sendButton}
            labelStyle={{ fontSize: 18 }}
          >
            Send
          </Button>
          <Button
            icon="delete"
            mode="contained"
            onPress={onDiscardRecording}
            style={styles.discardButton}
            labelStyle={{ fontSize: 18 }}
          >
            Discard Recording
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#32CD32',
    margin: 10,
    width: 200,
  },
  stopButton: {
    backgroundColor: '#FF0000',
    margin: 10,
    width: 200,
  },
  playButton: {
    backgroundColor: '#1E90FF',
    margin: 10,
    width: 200,
  },
  sendButton: {
    backgroundColor: '#FFA500',
    margin: 10,
    width: 200,
  },
  discardButton: {
    backgroundColor: '#808080',
    margin: 10,
    width: 200,
  },
});

export default AudioRecorderComponent;
