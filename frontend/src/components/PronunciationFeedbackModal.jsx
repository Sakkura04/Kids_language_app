import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

const PronunciationFeedbackModal = ({ visible, onClose, feedbackData }) => {
    const { transcription, feedback, feedback_sentence, correct_audio, segment_audios } = feedbackData;

    const playAudio = async (base64Audio) => {
        try {
            const path = `${RNFS.CachesDirectoryPath}/temp_audio_${Date.now()}.wav`;
            await RNFS.writeFile(path, base64Audio, 'base64');

            const sound = new Sound(path, '', (error) => {
                if (error) {
                    console.log('Failed to load the sound', error);
                    Alert.alert('Error', 'Failed to load audio.');
                    return;
                }
                sound.play(() => {
                    sound.release();
                    // Remove the temporary file after playback
                    RNFS.unlink(path).catch((err) => console.log('Failed to delete temp audio', err));
                });
            });
        } catch (error) {
            console.error('Error playing audio:', error);
            Alert.alert('Error', 'Failed to play audio.');
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalView}>
                    <ScrollView>
                        <Text style={styles.title}>Awesome Job!</Text>
                        <Text style={styles.subtitle}>Your Pronunciation:</Text>
                        <Text style={styles.transcriptionText}>{transcription}</Text>

                        <Text style={styles.subtitle}>How Did You Do?</Text>
                        {feedback.map((item, index) => (
                            <View key={index} style={styles.segmentContainer}>
                                <Text style={styles.segmentText}>{item.segment}</Text>
                                <Text style={[
                                    styles.statusText,
                                    item.status === 'correct' ? styles.correct :
                                        item.status === 'close enough' ? styles.close :
                                            styles.incorrect
                                ]}>
                                    {item.status}
                                </Text>
                                {item.status && (
                                    <TouchableOpacity
                                        style={styles.playButton}
                                        onPress={() => playAudio(segment_audios[item.segment])}
                                    >
                                        <Text style={styles.playButtonText}>Hear the Correct Pronunciation</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        <Text style={styles.feedbackSentence}>{feedback_sentence}</Text>

                        <Text style={styles.subtitle}>Hear It Again:</Text>
                        <TouchableOpacity
                            style={styles.playFullButton}
                            onPress={() => playAudio(correct_audio)}
                        >
                            <Text style={styles.playButtonText}>Play Correct Pronunciation</Text>
                        </TouchableOpacity>
                    </ScrollView>
                    <Button mode="contained" onPress={onClose} style={styles.closeButton}>
                        Close
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#FFF8DC',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#FFA500',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 10,
        color: '#333',
    },
    transcriptionText: {
        fontSize: 16,
        marginVertical: 5,
        textAlign: 'center',
        color: '#555',
    },
    segmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        flexWrap: 'wrap',
    },
    segmentText: {
        fontSize: 16,
        fontWeight: '500',
        marginRight: 10,
        color: '#333',
    },
    statusText: {
        fontSize: 16,
        fontWeight: '500',
    },
    correct: {
        color: 'green',
    },
    close: {
        color: 'orange',
    },
    incorrect: {
        color: 'red',
    },
    playButton: {
        marginLeft: 10,
        backgroundColor: '#1E90FF',
        padding: 5,
        borderRadius: 5,
        marginTop: 5,
    },
    playFullButton: {
        marginTop: 10,
        backgroundColor: '#32CD32',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    playButtonText: {
        color: 'white',
        fontSize: 14,
    },
    feedbackSentence: {
        fontSize: 16,
        marginVertical: 10,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#555',
    },
    closeButton: {
        marginTop: 10,
        width: '100%',
        backgroundColor: '#FFA500',
    },
});

export default PronunciationFeedbackModal;
