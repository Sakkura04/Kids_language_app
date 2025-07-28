import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Button } from 'react-native-paper';
import RNFS from 'react-native-fs';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const audioRecorderPlayer = new AudioRecorderPlayer();

const CustomAudioRecorder = ({ currentWord, onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedPath, setRecordedPath] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const initPath = Platform.select({
            ios: `${RNFS.DocumentDirectoryPath}/${currentWord}.m4a`,
            android: `${RNFS.DocumentDirectoryPath}/${currentWord}.mp4`,
        });
        setRecordedPath(initPath);
    }, [currentWord]);

    const requestPermissionsHandler = async () => {
        let permission = PERMISSIONS.ANDROID.RECORD_AUDIO;
        if (Platform.OS === 'ios') {
            permission = PERMISSIONS.IOS.MICROPHONE;
        }

        const result = await request(permission);
        return result === RESULTS.GRANTED;
    };

    const onStartRecord = async () => {
        const hasPermission = await requestPermissionsHandler();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Cannot record without microphone permission.');
            return;
        }

        try {
            const uri = await audioRecorderPlayer.startRecorder(recordedPath);
            audioRecorderPlayer.addRecordBackListener((e) => {
                // Optionally, update UI with recording time
                return;
            });
            setIsRecording(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert('Error', 'Failed to start recording.');
        }
    };

    const onStopRecord = async () => {
        try {
            const result = await audioRecorderPlayer.stopRecorder();
            audioRecorderPlayer.removeRecordBackListener();
            setIsRecording(false);
            Alert.alert('Recording Stopped', 'Your pronunciation has been recorded.');
        } catch (error) {
            console.error('Failed to stop recording:', error);
            Alert.alert('Error', 'Failed to stop recording.');
        }
    };

    const onPlayRecord = async () => {
        if (!recordedPath) {
            Alert.alert('No Recording', 'Please record a pronunciation first.');
            return;
        }

        try {
            setIsPlaying(true);
            await audioRecorderPlayer.startPlayer(recordedPath);
            audioRecorderPlayer.addPlayBackListener((e) => {
                if (e.current_position === e.duration) {
                    audioRecorderPlayer.stopPlayer();
                    setIsPlaying(false);
                }
                return;
            });
        } catch (error) {
            console.error('Failed to play recording:', error);
            Alert.alert('Error', 'Failed to play recording.');
            setIsPlaying(false);
        }
    };

    const onSendRecording = async () => {
        try {
            const exists = await RNFS.exists(recordedPath);
            if (!exists) {
                Alert.alert('No Recording', 'Please record a pronunciation first.');
                return;
            }

            const audioBase64 = await RNFS.readFile(recordedPath, 'base64');

            // Callback to parent component
            onRecordingComplete(audioBase64);
        } catch (error) {
            console.error('Failed to send recording:', error);
            Alert.alert('Error', 'Failed to send recording.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.wordLabel}>Pronounce: {currentWord}</Text>
            <View style={styles.buttonContainer}>
                {!isRecording ? (
                    <TouchableOpacity style={styles.recordButton} onPress={onStartRecord}>
                        <Text style={styles.buttonText}>Start Recording</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.stopButton} onPress={onStopRecord}>
                        <Text style={styles.buttonText}>Stop Recording</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.playButton} onPress={onPlayRecord} disabled={isRecording}>
                    <Text style={styles.buttonText}>{isPlaying ? 'Playing...' : 'Play Recording'}</Text>
                </TouchableOpacity>
                <Button mode="contained" onPress={onSendRecording} style={styles.sendButton}>
                    Send
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 20,
    },
    wordLabel: {
        fontSize: 20,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    recordButton: {
        backgroundColor: '#32CD32',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        width: 200,
        alignItems: 'center',
    },
    stopButton: {
        backgroundColor: '#FF0000',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        width: 200,
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: '#1E90FF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        width: 200,
        alignItems: 'center',
    },
    sendButton: {
        backgroundColor: '#FFA500',
        padding: 15,
        borderRadius: 5,
        width: 200,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default CustomAudioRecorder;
