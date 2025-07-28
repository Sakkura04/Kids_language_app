import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import CustomAudioRecorder from '../components/CustomAudioRecorder.jsx';
import PronunciationFeedbackModal from '../components/PronunciationFeedbackModal.jsx';
import config from '../config';
import { Button } from 'react-native-paper';

const PronunciationScreen = () => {
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [feedbackData, setFeedbackData] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [segments, setSegments] = useState([]);

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
            const selectedWords = data.words.slice(0, 10); // Select first 10 words
            setWords(selectedWords);

            // Set initial segments for the first word
            if (selectedWords.length > 0) {
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
            setCurrentIndex(currentIndex + 1);
            setFeedbackData(null);
            setSegments(words[currentIndex + 1].segments); // Update segments for the next word
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

    const currentWord = words[currentIndex]?.word;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pronunciation Practice</Text>
            <View style={styles.wordContainer}>
                <Text style={styles.wordText}>{currentWord}</Text>
                {/* Display the breakdown of the word */}
                <View style={styles.breakdownContainer}>
                    {segments.map((segment, index) => (
                        <Text key={index} style={styles.segmentText}>
                            {segment}
                            {index < segments.length - 1 && <Text>-</Text>}
                        </Text>
                    ))}
                </View>
            </View>
            <CustomAudioRecorder
                currentWord={currentWord}
                onRecordingComplete={handleRecordingComplete}
            />
            {feedbackData && (
                <PronunciationFeedbackModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    feedbackData={feedbackData}
                />
            )}
            {feedbackData && (
                <Button mode="contained" onPress={handleNextWord} style={styles.nextButton}>
                    Next
                </Button>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFFAF0',
        alignItems: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFAF0',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#FFA500',
    },
    wordContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    wordText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#333',
        marginTop: 10,
    },
    breakdownContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    segmentText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#555',
        marginHorizontal: 2,
    },
    nextButton: {
        marginTop: 20,
        width: 200,
        backgroundColor: '#32CD32',
    },
});

export default PronunciationScreen;
