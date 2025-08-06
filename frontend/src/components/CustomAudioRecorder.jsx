import React, { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const audioRecorderPlayer = new AudioRecorderPlayer();

const CustomAudioRecorder = ({ currentWord, onRecordingComplete, isVisible = false }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedPath, setRecordedPath] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);

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

    const startRecording = async () => {
        const hasPermission = await requestPermissionsHandler();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Cannot record without microphone permission.');
            return false;
        }

        try {
            const uri = await audioRecorderPlayer.startRecorder(recordedPath);
            audioRecorderPlayer.addRecordBackListener((e) => {
                return;
            });
            setIsRecording(true);
            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert('Error', 'Failed to start recording.');
            return false;
        }
    };

    const stopRecording = async () => {
        try {
            const result = await audioRecorderPlayer.stopRecorder();
            audioRecorderPlayer.removeRecordBackListener();
            setIsRecording(false);
            setHasRecording(true);
            Alert.alert('Recording Stopped', 'Your pronunciation has been recorded.');
            return true;
        } catch (error) {
            console.error('Failed to stop recording:', error);
            Alert.alert('Error', 'Failed to stop recording.');
            return false;
        }
    };

    const playRecording = async () => {
        if (!hasRecording || !recordedPath) {
            Alert.alert('No Recording', 'Please record a pronunciation first.');
            return false;
        }

        try {
            const exists = await RNFS.exists(recordedPath);
            if (!exists) {
                Alert.alert('No Recording', 'Please record a pronunciation first.');
                return false;
            }

            setIsPlaying(true);
            await audioRecorderPlayer.startPlayer(recordedPath);
            audioRecorderPlayer.addPlayBackListener((e) => {
                if (e.current_position === e.duration) {
                    audioRecorderPlayer.stopPlayer();
                    setIsPlaying(false);
                }
                return;
            });
            return true;
        } catch (error) {
            console.error('Failed to play recording:', error);
            Alert.alert('Error', 'Failed to play recording.');
            setIsPlaying(false);
            return false;
        }
    };

    const sendRecording = async () => {
        if (!hasRecording || !recordedPath) {
            Alert.alert('No Recording', 'Please record a pronunciation first.');
            return false;
        }

        try {
            const exists = await RNFS.exists(recordedPath);
            if (!exists) {
                Alert.alert('No Recording', 'Please record a pronunciation first.');
                return false;
            }

            const audioBase64 = await RNFS.readFile(recordedPath, 'base64');
            onRecordingComplete(audioBase64);
            return true;
        } catch (error) {
            console.error('Failed to send recording:', error);
            Alert.alert('Error', 'Failed to send recording.');
            return false;
        }
    };

    // Don't render anything if not visible
    if (!isVisible) {
        return null;
    }

    // Return null since we don't want to render any UI
    return null;
};

// Export the functions so they can be used externally
export { CustomAudioRecorder };
export const createAudioRecorder = () => {
    return {
        startRecording,
        stopRecording,
        playRecording,
        sendRecording,
        isRecording: () => isRecording,
        hasRecording: () => hasRecording,
        isPlaying: () => isPlaying
    };
};
