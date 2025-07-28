// src/screens/VocabularyScreen.jsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    Image,
    Dimensions
} from 'react-native';
import { Card, Button, RadioButton, ProgressBar } from 'react-native-paper';
import globalStyles from '../styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';

// Sample Lottie animations
const correctAnimation = require('../../assets/animations/correct.json');
const incorrectAnimation = require('../../assets/animations/incorrect.json');

const VocabularyScreen = () => {
    // Sample vocabulary data
    const initialVocabulary = [
        {
            id: 1,
            word: 'Eloquent',
            meaning: 'Fluent or persuasive in speaking or writing.',
            options: [
                'Having a pleasant taste',
                'Fluent or persuasive in speaking or writing.',
                'Relating to plants',
                'Capable of flying',
            ],
            level: 1, // Difficulty level
            correct: false,
            image: require('../../assets/images/eloquent.jpg'), // Add relevant images
            synonyms: ['Articulate', 'Expressive'],
            antonyms: ['Inarticulate', 'Mumbling'],
            example: 'She gave an eloquent speech that moved everyone.',
            category: 'Advanced',
        },
        {
            id: 2,
            word: 'Candid',
            meaning: 'Truthful and straightforward; frank.',
            options: [
                'Secretive and hidden',
                'Joyful and happy',
                'Truthful and straightforward; frank.',
                'Slow-moving',
            ],
            level: 1,
            correct: false,
            image: require('../../assets/images/candid.jpg'),
            synonyms: ['Honest', 'Sincere'],
            antonyms: ['Dishonest', 'Insincere'],
            example: 'He was candid about his mistakes.',
            category: 'Basic',
        },
        {
            id: 3,
            word: 'Apple',
            meaning: 'A round fruit with red or green skin and a sweet taste.',
            options: [
                'A large wild animal',
                'A type of vehicle',
                'A round fruit with red or green skin and a sweet taste.',
                'A place to live',
            ],
            level: 1, // Difficulty level
            correct: false,
            image: require('../../assets/images/apple.png'), // Add relevant images
            synonyms: ['Fruit', 'Snack'],
            antonyms: ['Vegetable', 'Meat'],
            example: 'She ate an apple for a snack.',
            category: 'Basic',
        },
        {
            id: 4,
            word: 'Dog',
            meaning: 'A common animal kept as a pet, known for barking.',
            options: [
                'A kind of bird',
                'A common animal kept as a pet, known for barking.',
                'A type of tree',
                'A large fish',
            ],
            level: 1,
            correct: false,
            image: require('../../assets/images/dog.png'),
            synonyms: ['Puppy', 'Canine'],
            antonyms: ['Cat', 'Kitten'],
            example: 'The dog ran around the park.',
            category: 'Basic',
        }
        ,
        {
            id: 5,
            word: 'Car',
            meaning: 'A vehicle with four wheels used for transporting people.',
            options: [
                'A type of fruit',
                'A vehicle with four wheels used for transporting people.',
                'A type of toy',
                'A place to sleep',
            ],
            level: 1,
            correct: false,
            image: require('../../assets/images/car.jpg'),
            synonyms: ['Vehicle', 'Automobile'],
            antonyms: ['Bicycle', 'Truck'],
            example: 'They drove the car to the beach.',
            category: 'Basic',
        },
    ];

    const [vocabulary, setVocabulary] = useState(initialVocabulary);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [progress, setProgress] = useState(0); // Track progress as percentage
    const [animationSource, setAnimationSource] = useState(null);
    const [streak, setStreak] = useState(0); // For tracking streaks
    const [badges, setBadges] = useState([]); // For storing badges

    useEffect(() => {
        // Update progress whenever currentWordIndex changes
        setProgress(((currentWordIndex) / vocabulary.length));
    }, [currentWordIndex, vocabulary.length]);

    useEffect(() => {
        // Check for badge milestones
        if (streak > 0 && streak % 5 === 0) {
            const newBadge = `🔥 ${streak}-Streak`;
            if (!badges.includes(newBadge)) {
                setBadges([...badges, newBadge]);
                Alert.alert('🎉 New Badge!', `You've achieved a ${streak}-streak!`, [
                    { text: 'Yay!', onPress: () => { } },
                ]);
            }
        }
    }, [streak, badges]);

    const handleSubmit = () => {
        const currentWord = vocabulary[currentWordIndex];
        if (selectedOption === currentWord.meaning) {
            setFeedback('Correct!');
            setAnimationSource(correctAnimation);
            updateWordLevel(currentWordIndex, true);
            setStreak(streak + 1); // Increment streak
        } else {
            setFeedback(`Incorrect! The correct meaning is: "${currentWord.meaning}"`);
            setAnimationSource(incorrectAnimation);
            updateWordLevel(currentWordIndex, false);
            setStreak(0); // Reset streak
        }
        setShowFeedback(true);
    };

    const updateWordLevel = (index, isCorrect) => {
        setVocabulary(prev => {
            const updated = [...prev];
            if (isCorrect && updated[index].level > 1) {
                updated[index].level -= 1; // Increase difficulty
            } else if (!isCorrect && updated[index].level < 3) {
                updated[index].level += 1; // Decrease difficulty
            }
            updated[index].correct = isCorrect;
            return updated;
        });
    };

    const handleNext = () => {
        setShowFeedback(false);
        setSelectedOption('');
        if (currentWordIndex < vocabulary.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
        } else {
            Alert.alert('🎉 Congratulations!', 'You have completed all vocabulary exercises.', [
                {
                    text: 'Awesome!', onPress: () => {
                        setCurrentWordIndex(0);
                        setStreak(0);
                    }
                },
            ]);
            // Optionally, reset progress or navigate to another screen
        }
    };

    const renderOption = (option) => (
        <TouchableOpacity
            style={[
                styles.optionContainer,
                selectedOption === option && styles.selectedOption
            ]}
            onPress={() => setSelectedOption(option)}
            activeOpacity={0.7}
        >
            <RadioButton
                value={option}
                status={selectedOption === option ? 'checked' : 'unchecked'}
                onPress={() => setSelectedOption(option)}
                color={globalStyles.colors.primary}
            />
            <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
    );

    const currentWord = vocabulary[currentWordIndex];

    return (
        <View style={styles.container}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <ProgressBar
                    progress={progress}
                    color={globalStyles.colors.accent}
                    style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                    {Math.round(progress * 100)}% Complete
                </Text>
            </View>

            {/* Badges */}
            {badges.length > 0 && (
                <View style={styles.badgesContainer}>
                    {badges.map((badge, index) => (
                        <View key={index} style={styles.badge}>
                            <Icon name="badge-account" size={24} color={globalStyles.colors.primary} />
                            <Text style={styles.badgeText}>{badge}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Streak */}
            <View style={styles.streakContainer}>
                <Icon name="fire" size={24} color={streak > 0 ? 'orange' : 'grey'} />
                <Text style={styles.streakText}>Streak: {streak}</Text>
            </View>

            {/* Word Card */}
            <Animatable.View
                animation="fadeIn"
                duration={800}
                style={styles.cardContainer}
            >
                <Card style={styles.card}>
                    <Card.Content>
                        {/* Word Image */}
                        {currentWord.image && (
                            <Image source={currentWord.image} style={styles.wordImage} />
                        )}

                        {/* Vocabulary Word */}
                        <Text style={styles.wordText}>{currentWord.word}</Text>

                        {/* Options */}
                        <FlatList
                            data={currentWord.options}
                            renderItem={({ item }) => renderOption(item)}
                            keyExtractor={(item, index) => index.toString()}
                            extraData={selectedOption}
                        />

                        {/* Submit Button */}
                        {!showFeedback && (
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                disabled={!selectedOption}
                                style={styles.submitButton}
                                labelStyle={styles.buttonLabel}
                                icon="check-circle"
                                accessibilityLabel="Submit your answer"
                                accessibilityHint="Press to submit your selected meaning"
                            >
                                Submit
                            </Button>
                        )}
                    </Card.Content>
                </Card>
            </Animatable.View>

            {/* Feedback Section */}
            {showFeedback && (
                <Animatable.View
                    animation="fadeInUp"
                    style={styles.feedbackContainer}
                >
                    {/* Feedback Animation */}
                    {animationSource && (
                        <LottieView
                            source={animationSource}
                            autoPlay
                            loop={false}
                            style={styles.feedbackAnimation}
                        />
                    )}

                    {/* Feedback Text */}
                    <Text style={feedback.includes('Correct') ? styles.correctText : styles.incorrectText}>
                        {feedback}
                    </Text>

                    {/* Synonyms, Antonyms, Example */}
                    {feedback.includes('Incorrect') && (
                        <View style={styles.additionalInfo}>
                            <Text style={styles.infoText}>
                                <Text style={styles.infoTitle}>Synonyms:</Text> {currentWord.synonyms.join(', ')}
                            </Text>
                            <Text style={styles.infoText}>
                                <Text style={styles.infoTitle}>Antonyms:</Text> {currentWord.antonyms.join(', ')}
                            </Text>
                            <Text style={styles.infoText}>
                                <Text style={styles.infoTitle}>Example:</Text> {currentWord.example}
                            </Text>
                        </View>
                    )}

                    {/* Next Button */}
                    <Button
                        mode="contained"
                        onPress={handleNext}
                        style={styles.nextButton}
                        labelStyle={styles.buttonLabel}
                        icon="arrow-right-circle"
                        accessibilityLabel="Proceed to the next word"
                        accessibilityHint="Press to go to the next vocabulary word"
                    >
                        Next
                    </Button>
                </Animatable.View>
            )}
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: globalStyles.colors.background,
    },
    progressContainer: {
        marginBottom: 10,
        alignItems: 'center',
    },
    progressBar: {
        height: 10,
        width: width * 0.9,
        borderRadius: 5,
    },
    progressText: {
        marginTop: 5,
        fontSize: 16,
        color: globalStyles.colors.text,
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
        justifyContent: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: globalStyles.colors.accent + '33', // Adding transparency
        padding: 8,
        borderRadius: 15,
        margin: 4,
    },
    badgeText: {
        marginLeft: 5,
        fontSize: 14,
        color: globalStyles.colors.text,
        fontWeight: 'bold',
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'center',
    },
    streakText: {
        marginLeft: 5,
        fontSize: 16,
        color: globalStyles.colors.text,
        fontWeight: 'bold',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    card: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        elevation: 4,
    },
    wordImage: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginBottom: 20,
        resizeMode: 'contain',
    },
    wordText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: globalStyles.colors.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f2f2f2',
    },
    selectedOption: {
        backgroundColor: globalStyles.colors.accent + '33', // Adding transparency
    },
    optionText: {
        fontSize: 18,
        color: globalStyles.colors.text,
    },
    submitButton: {
        marginTop: 20,
        borderRadius: 20,
        padding: 10,
        backgroundColor: globalStyles.colors.primary,
        justifyContent: 'center',
    },
    nextButton: {
        marginTop: 10,
        borderRadius: 20,
        padding: 10,
        backgroundColor: globalStyles.colors.accent,
        justifyContent: 'center',
    },
    buttonLabel: {
        fontSize: 18,
        marginLeft: 5,
    },
    feedbackContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    correctText: {
        fontSize: 20,
        color: 'green',
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    incorrectText: {
        fontSize: 20,
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    feedbackAnimation: {
        width: 150,
        height: 150,
    },
    additionalInfo: {
        marginTop: 10,
        paddingHorizontal: 20,
    },
    infoText: {
        fontSize: 16,
        color: globalStyles.colors.text,
        textAlign: 'center',
        marginVertical: 2,
    },
    infoTitle: {
        fontWeight: 'bold',
        color: globalStyles.colors.primary,
    },
});

export default VocabularyScreen;
