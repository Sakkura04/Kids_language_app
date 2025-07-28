import React, { useState, useEffect } from 'react';
import { View, PermissionsAndroid, Platform, Alert, Linking, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Button } from 'react-native-paper';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

const AudioRecorderComponent = ({ currentText, navigation }) => {
  console.log("AudioRecorderComponent called");
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
    console.log("openSettings called");
    Linking.openSettings();
  };

  const onStartRecord = async () => {
    console.log("onStartRecord called");
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
    console.log("onStopRecord called");
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    setIsReviewMode(true);
  };

  const onPlayRecordedAudio = async () => {
    console.log("onPlayRecordedAudio called");
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
    console.log("onSendRecording called");
    try {
      const exists = await RNFS.exists(recordPath);
      if (!exists) {
        console.error('File does not exist:', recordPath);
        return;
      }

      const audioBase64 = await RNFS.readFile(recordPath, 'base64');

      let dataToSend = {
        audio: audioBase64,
        displayed_text: currentText,
      };

      fetch('http://134.190.225.163:5000/process-recorded-text', {
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
    console.log("onDiscardRecording called");
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
    <View style={styles.buttonRow}>
      {/* Start/Stop button */}
      {!isRecording && !isReviewMode && (
        <TouchableOpacity style={[styles.actionButton, styles.startButton]} onPress={onStartRecord}>
          <Text style={styles.actionButtonText}>START</Text>
        </TouchableOpacity>
      )}
      {isRecording && (
        <TouchableOpacity style={[styles.actionButton, styles.stopButton]} onPress={onStopRecord}>
          <Text style={styles.stopButtonText}>STOP</Text>
        </TouchableOpacity>
      )}
      {/* Play button */}
      <TouchableOpacity
        style={[styles.actionButton, styles.playButton, (!isReviewMode || isRecording) && { opacity: 0.5 }]}
            onPress={onPlayRecordedAudio}
        disabled={!isReviewMode || isRecording}
      >
        <Text style={styles.actionButtonText}>PLAY</Text>
      </TouchableOpacity>
      {/* Send button */}
      <TouchableOpacity
        style={[styles.actionButton, styles.sendButton, (!isReviewMode || isRecording) && { opacity: 0.5 }]}
            onPress={onSendRecording}
        disabled={!isReviewMode || isRecording}
      >
        <Text style={styles.actionButtonText}>SEND</Text>
      </TouchableOpacity>
      {/* Discard button (only after recording is finished) */}
      {isReviewMode && !isRecording && (
        <TouchableOpacity style={[styles.actionButton, styles.discardButton]} onPress={onDiscardRecording}>
          <Text style={styles.actionButtonText}>DISCARD</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  actionButton: {
    flexBasis: '25%',
    height: '47%',
    borderRadius: 25,
    marginHorizontal: '2%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  startButton: {
    backgroundColor: '#32B6E6',
  },
  playButton: {
    backgroundColor: '#32B6E6',
  },
  sendButton: {
    backgroundColor: '#bcd175',
  },
  discardButton: {
    backgroundColor: '#f68677',
  },
  stopButton: {
    backgroundColor: '#8decef',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'PermanentMarker',
    letterSpacing: 1,
  },
  stopButtonText: {
    color: '#32B6E6',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'PermanentMarker',
    letterSpacing: 1,
  },
});

export default AudioRecorderComponent;
