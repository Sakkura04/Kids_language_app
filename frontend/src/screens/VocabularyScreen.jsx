// src/screens/VocabularyScreen.jsx

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Image,
    Dimensions,
    Platform,
    Animated,
    ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { PanResponder, StyleSheet as RNStyleSheet } from 'react-native';

const correctAnimation = require('../../assets/animations/correct.json');
const incorrectAnimation = require('../../assets/animations/incorrect.json');
const skyBg = require('../../assets/images/sky.jpeg');
const mascot = require('../../assets/images/vocabularyscreen.png');
const mascot2 = require('../../assets/images/vocabularyscreen2.png');

const { width, height } = Dimensions.get('window');

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
            synonyms: ['Articulate', 'Expressive'],
            antonyms: ['Inarticulate', 'Mumbling'],
            example: 'She gave an eloquent speech that moved everyone.',
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
            synonyms: ['Honest', 'Sincere'],
            antonyms: ['Dishonest', 'Insincere'],
            example: 'He was candid about his mistakes.',
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
            synonyms: ['Fruit', 'Snack'],
            antonyms: ['Vegetable', 'Meat'],
            example: 'She ate an apple for a snack.',
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
            synonyms: ['Puppy', 'Canine'],
            antonyms: ['Cat', 'Kitten'],
            example: 'The dog ran around the park.',
    },
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
            synonyms: ['Vehicle', 'Automobile'],
            antonyms: ['Bicycle', 'Truck'],
            example: 'They drove the car to the beach.',
    },
];

const MENU_CLOSED_Y = 45;
const MENU_HEIGHT = height * 0.51;
const MENU_ITEMS = [
  { label: 'Home', screen: 'Home' },
  { label: 'Results', screen: 'Results' },
  { label: 'Record', screen: 'Record' },
  { label: 'Vocabulary', screen: 'Vocabulary' },
  { label: 'Pronunciation', screen: 'Pronunciation' },
];

const VocabularyScreen = () => {
    const [vocabulary, setVocabulary] = useState(initialVocabulary);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [animationSource, setAnimationSource] = useState(null);
    const [showFeedbackDetails, setShowFeedbackDetails] = useState(false);
    const [fadeIncorrect, setFadeIncorrect] = useState(false);
    const [moveCorrectToTop, setMoveCorrectToTop] = useState(false);
    const [moveDistance, setMoveDistance] = React.useState(0);
    const optionHeight = 64; // Approximate height of each option (including margin)

    const navigation = useNavigation();
    const [menuOpen, setMenuOpen] = useState(false);
    const translateY = React.useRef(new Animated.Value(MENU_HEIGHT - MENU_CLOSED_Y)).current;

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
    const panResponder = React.useRef(
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

    const currentWord = vocabulary[currentWordIndex];

    const handleOptionSelect = (option) => {
        if (!showFeedback) setSelectedOption(option);
    };

    const handleSubmit = () => {
        if (!selectedOption) return;
        const correct = selectedOption === currentWord.meaning;
        setIsCorrect(correct);
        setAnimationSource(correct ? correctAnimation : incorrectAnimation);
        setShowFeedback(true);
        if (correct) {
            setShowFeedbackDetails(true);
            setFadeIncorrect(false);
            setMoveCorrectToTop(false);
        } else {
            setShowFeedbackDetails(false);
            setFadeIncorrect(false);
            setMoveCorrectToTop(false);
        }
    };

    const handleNext = () => {
        setShowFeedback(false);
        setSelectedOption(null);
        setIsCorrect(false);
        setAnimationSource(null);
        setShowFeedbackDetails(false);
        setFadeIncorrect(false);
        setMoveCorrectToTop(false);
        if (currentWordIndex < vocabulary.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
        } else {
                        setCurrentWordIndex(0);
        }
    };

    // Option color logic
    const getOptionStyle = (option) => {
        if (!showFeedback) {
            return selectedOption === option ? styles.optionSelected : styles.option;
        }
        if (showFeedback) {
            if (option === selectedOption && !isCorrect) {
                return [styles.option, styles.optionIncorrect];
            }
            if (option === currentWord.meaning) {
                return [styles.option, styles.optionCorrect];
            }
            return styles.option;
        }
    };

    // Option radio logic
    const getRadioStyle = (option) => {
        if (!showFeedback) {
            return selectedOption === option ? styles.radioSelected : styles.radio;
        }
        if (showFeedback) {
            if (option === selectedOption && !isCorrect) {
                return [styles.radio, styles.radioIncorrect];
            }
            if (option === currentWord.meaning) {
                return [styles.radio, styles.radioCorrect];
            }
            return styles.radio;
        }
    };

    // After fade animation, move correct option to top
    React.useEffect(() => {
        if (fadeIncorrect && showFeedback && !isCorrect && showFeedbackDetails) {
            // After fade, move correct to top
            const timer = setTimeout(() => setMoveCorrectToTop(true), 350); // 350ms after fade
            return () => clearTimeout(timer);
        } else {
            setMoveCorrectToTop(false);
        }
    }, [fadeIncorrect, showFeedback, isCorrect, showFeedbackDetails]);

    // Calculate move distance when moveCorrectToTop is triggered
    React.useEffect(() => {
        if (moveCorrectToTop && !showOnlyCorrectOption) {
            const correctIdx = currentWord.options.findIndex(opt => opt === currentWord.meaning);
            setMoveDistance(-correctIdx * optionHeight);
        }
    }, [moveCorrectToTop, showOnlyCorrectOption, currentWord]);

    // Add state for animation
    const [moveUpAnim] = React.useState(new Animated.Value(0));
    const [fadeAnim] = React.useState(new Animated.Value(1));
    const [showInfoLines, setShowInfoLines] = React.useState(false);
    const [showOnlyCorrectOption, setShowOnlyCorrectOption] = React.useState(false);

    // Animate both fade and move up when moveCorrectToTop becomes true
    React.useEffect(() => {
        if (moveCorrectToTop) {
            setShowInfoLines(false);
            setShowOnlyCorrectOption(false);
            Animated.parallel([
                Animated.timing(moveUpAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setShowOnlyCorrectOption(true);
                setShowInfoLines(true);
            });
        } else {
            moveUpAnim.setValue(0);
            fadeAnim.setValue(1);
            setShowInfoLines(false);
            setShowOnlyCorrectOption(false);
        }
    }, [moveCorrectToTop]);

    // Render options
    let optionsToRender = currentWord.options;
    if (showOnlyCorrectOption) {
        optionsToRender = [currentWord.meaning];
    }

    return (
        <ImageBackground source={skyBg} style={styles.bg} resizeMode="cover">
            <View style={styles.centerGroup}>
                {/* Word Box */}
                <View style={styles.wordContainer}>
                    <Text style={styles.wordText}>{currentWord.word}</Text>
                    <Image source={showInfoLines ? mascot2 : mascot} style={styles.mascot} resizeMode="contain" />
                </View>
                {/* Answers Box */}
                <View style={styles.answersBox}>
                    <View style={styles.optionsContainer}>
                        {optionsToRender.map((option, idx) => {
                            let optionStyle = [styles.option];
                            let isThisCorrectSelected = showFeedback && isCorrect && selectedOption === option;
                            let isThisIncorrectSelected = showFeedback && !isCorrect && selectedOption === option;
                            if (!showFeedback && selectedOption === option) optionStyle.push(styles.optionSelected);
                            if (showFeedback && option === selectedOption && !isCorrect) optionStyle.push(styles.optionIncorrect);
                            if (showFeedback && option === currentWord.meaning) optionStyle.push(styles.optionCorrect);
                            if (moveCorrectToTop && option === currentWord.meaning) {
                                optionStyle.push(styles.optionCorrectTop);
                            }
                            // Animate only the correct option when moveCorrectToTop is true
                            if (moveCorrectToTop && option === currentWord.meaning) {
                                return (
                                    <Animated.View
                                        key={idx}
                                        style={{
                                            transform: [{
                                                translateY: moveUpAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, moveDistance],
                                                }),
                                            }],
                                        }}
                                    >
                                        <View style={optionStyle}>
                                            <Animatable.View
                                                animation={isThisIncorrectSelected ? 'flash' : undefined}
                                                duration={2000}
                                                iterationCount={1}
                                                easing="ease-in-out"
                                                useNativeDriver={false}
                                                onAnimationEnd={isThisIncorrectSelected ? () => {
                                                    setTimeout(() => setMoveCorrectToTop(true), 100);
                                                } : undefined}
                                                style={{ width: '100%' }}
                                            >
                                                <TouchableOpacity
                                                    style={{ width: '100%', minHeight: 44, flexDirection: 'row', alignItems: 'center' }}
                                                    activeOpacity={0.8}
                                                    onPress={() => handleOptionSelect(option)}
                                                    disabled={showFeedback}
                                                >
                                                    <View style={getRadioStyle(option)}>
                                                        {isThisCorrectSelected ? (
                                                            <Text style={styles.checkMark}>✔</Text>
                                                        ) : isThisIncorrectSelected ? (
                                                            <Text style={styles.radioCross}>✗</Text>
                                                        ) : (
                                                            (!showFeedback && selectedOption === option) ||
                                                            (showFeedback && ((option === selectedOption && !isCorrect) || option === currentWord.meaning))
                                                        ) && (
                                                            <View style={styles.radioDot} />
                                                        )}
                                                    </View>
                                                    {(showFeedback && isCorrect && selectedOption === option) ? (
    <Animatable.Text
        animation="flash"
        duration={3000}
        iterationCount={1}
        style={[
            styles.optionText,
            (selectedOption === option && !showFeedback) && styles.optionTextSelected,
            showFeedback && option === currentWord.meaning && { color: '#7ca11f', fontWeight: 'bold' },
            isThisCorrectSelected && styles.optionTextCorrect,
            moveCorrectToTop && option === currentWord.meaning && styles.optionTextCorrectTop,
            isThisIncorrectSelected && styles.optionTextIncorrectBlink,
            isThisCorrectSelected && styles.optionTextCorrectBlink,
        ]}
    >{option}</Animatable.Text>
) : (
    <Text style={[
        styles.optionText,
        (selectedOption === option && !showFeedback) && styles.optionTextSelected,
        showFeedback && option === currentWord.meaning && { color: '#7ca11f', fontWeight: 'bold' },
        isThisCorrectSelected && styles.optionTextCorrect,
        moveCorrectToTop && option === currentWord.meaning && styles.optionTextCorrectTop,
        isThisIncorrectSelected && styles.optionTextIncorrectBlink,
        isThisCorrectSelected && styles.optionTextCorrectBlink,
    ]}>{option}</Text>
)}
                                                </TouchableOpacity>
                                            </Animatable.View>
            </View>
                                    </Animated.View>
                                );
                            }
                            // In the map, after the fade animation, keep all options rendered, but only set height: 0 and margin: 0 for incorrect options after the animation is fully done
                            if (showOnlyCorrectOption && option !== currentWord.meaning) {
                                return (
                                    <Animated.View
                                        key={idx}
                                        style={{ opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
                                        pointerEvents="none"
                                    />
                                );
                            }
                            // During the animation, keep all options at their original height/margin, only animate opacity
                            if (moveCorrectToTop && !showOnlyCorrectOption && option !== currentWord.meaning) {
                                return (
                                    <Animated.View key={idx} style={{ opacity: fadeAnim }} pointerEvents="none">
                                        <View style={optionStyle}>
                                            <Animatable.View
                                                animation={isThisIncorrectSelected ? 'flash' : undefined}
                                                duration={2000}
                                                iterationCount={1}
                                                easing="ease-in-out"
                                                useNativeDriver={false}
                                                style={{ width: '100%' }}
                                            >
                                                <TouchableOpacity
                                                    style={{ width: '100%', minHeight: 44, flexDirection: 'row', alignItems: 'center' }}
                                                    activeOpacity={0.8}
                                                    onPress={() => handleOptionSelect(option)}
                                                    disabled={showFeedback}
                                                >
                                                    <View style={getRadioStyle(option)}>
                                                        {isThisCorrectSelected ? (
                                                            <Text style={styles.checkMark}>✔</Text>
                                                        ) : isThisIncorrectSelected ? (
                                                            <Text style={styles.radioCross}>✗</Text>
                                                        ) : (
                                                            (!showFeedback && selectedOption === option) ||
                                                            (showFeedback && ((option === selectedOption && !isCorrect) || option === currentWord.meaning))
                                                        ) && (
                                                            <View style={styles.radioDot} />
                                                        )}
                                                    </View>
                                                    {(showFeedback && isCorrect && selectedOption === option) ? (
    <Animatable.Text
        animation="flash"
        duration={200}
        iterationCount={1}
        style={[
            styles.optionText,
            (selectedOption === option && !showFeedback) && styles.optionTextSelected,
            showFeedback && option === currentWord.meaning && { color: '#7ca11f', fontWeight: 'bold' },
            isThisCorrectSelected && styles.optionTextCorrect,
            moveCorrectToTop && option === currentWord.meaning && styles.optionTextCorrectTop,
            isThisIncorrectSelected && styles.optionTextIncorrectBlink,
            isThisCorrectSelected && styles.optionTextCorrectBlink,
        ]}
    >{option}</Animatable.Text>
) : (
    <Text style={[
        styles.optionText,
        (selectedOption === option && !showFeedback) && styles.optionTextSelected,
        showFeedback && option === currentWord.meaning && { color: '#7ca11f', fontWeight: 'bold' },
        isThisCorrectSelected && styles.optionTextCorrect,
        moveCorrectToTop && option === currentWord.meaning && styles.optionTextCorrectTop,
        isThisIncorrectSelected && styles.optionTextIncorrectBlink,
        isThisCorrectSelected && styles.optionTextCorrectBlink,
    ]}>{option}</Text>
)}
                                                </TouchableOpacity>
                                            </Animatable.View>
                                        </View>
                                    </Animated.View>
                                );
                            }
                            // Default render for other options
                            return (
                                <View key={idx} style={optionStyle}>
            <Animatable.View
                                        animation={isThisIncorrectSelected ? 'flash' : undefined}
                                        duration={2000}
                                        iterationCount={1}
                                        easing="ease-in-out"
                                        useNativeDriver={false}
                                        onAnimationEnd={isThisIncorrectSelected ? () => {
                                            setShowFeedbackDetails(true);
                                            setTimeout(() => setFadeIncorrect(true), 100);
                                        } : undefined}
                                        style={{ width: '100%' }}
                                    >
                                        <TouchableOpacity
                                            style={{ width: '100%', minHeight: 44, flexDirection: 'row', alignItems: 'center' }}
                                            activeOpacity={0.8}
                                            onPress={() => handleOptionSelect(option)}
                                            disabled={showFeedback}
                                        >
                                            <View style={getRadioStyle(option)}>
                                                {isThisCorrectSelected ? (
                                                    <Text style={styles.checkMark}>✔</Text>
                                                ) : isThisIncorrectSelected ? (
                                                    <Text style={styles.radioCross}>✗</Text>
                                                ) : (
                                                    (!showFeedback && selectedOption === option) ||
                                                    (showFeedback && ((option === selectedOption && !isCorrect) || option === currentWord.meaning))
                                                ) && (
                                                    <View style={styles.radioDot} />
                                                )}
                                            </View>
                                            {(showFeedback && isCorrect && selectedOption === option) ? (
    <Animatable.Text
        animation="flash"
        duration={2000}
        iterationCount={1}
        style={[
            styles.optionText,
            (selectedOption === option && !showFeedback) && styles.optionTextSelected,
            showFeedback && option === currentWord.meaning && { color: '#7ca11f', fontWeight: 'bold' },
            isThisCorrectSelected && styles.optionTextCorrect,
            moveCorrectToTop && option === currentWord.meaning && styles.optionTextCorrectTop,
            isThisIncorrectSelected && styles.optionTextIncorrectBlink,
            isThisCorrectSelected && styles.optionTextCorrectBlink,
        ]}
    >{option}</Animatable.Text>
) : (
    <Text style={[
        styles.optionText,
        (selectedOption === option && !showFeedback) && styles.optionTextSelected,
        showFeedback && option === currentWord.meaning && { color: '#7ca11f', fontWeight: 'bold' },
        isThisCorrectSelected && styles.optionTextCorrect,
        moveCorrectToTop && option === currentWord.meaning && styles.optionTextCorrectTop,
        isThisIncorrectSelected && styles.optionTextIncorrectBlink,
        isThisCorrectSelected && styles.optionTextCorrectBlink,
    ]}>{option}</Text>
)}
                                        </TouchableOpacity>
            </Animatable.View>
                                </View>
                            );
                        })}
                    </View>
            {/* Feedback Section */}
                    {showFeedback && !isCorrect && showFeedbackDetails && !moveCorrectToTop && (
                        <Animatable.View animation="fadeInUp" style={styles.feedbackSection}>
                        </Animatable.View>
                    )}
                    {/* Only show info lines after both animations complete */}
                    {showInfoLines && (
                        <View style={styles.infoLinesContainer}>
                            <View style={styles.infoLine}>
                                <View style={styles.infoLabelPill}><Text style={styles.infoLabelText}>SYNONYM</Text></View>
                                <Text style={styles.infoLineText}>{currentWord.synonyms.join(', ')}</Text>
                            </View>
                            <View style={styles.infoLine}>
                                <View style={styles.infoLabelPill}><Text style={styles.infoLabelText}>ANTONYMS</Text></View>
                                <Text style={styles.infoLineText}>{currentWord.antonyms.join(', ')}</Text>
                            </View>
                            <View style={styles.infoLine}>
                                <View style={styles.infoLabelPill}><Text style={styles.infoLabelText}>EXAMPLE</Text></View>
                                <Text style={styles.infoLineText}>{currentWord.example}</Text>
                            </View>
                        </View>
                    )}
                    {/* Both buttons visible, only one enabled */}
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 16 }}>
                        <TouchableOpacity
                            style={[styles.sendButton, showFeedback && { opacity: 0.5 }]}
                            onPress={handleSubmit}
                            activeOpacity={0.8}
                            disabled={showFeedback || !selectedOption}
                        >
                            <Text style={styles.buttonText}>SEND</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.nextButton, !showFeedback && { opacity: 0.5 }]}
                        onPress={handleNext}
                            activeOpacity={0.8}
                            disabled={!showFeedback}
                        >
                            <Text style={styles.buttonText}>NEXT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* Pull-up menu handle */}
            <View style={styles.menuHandleBarContainer} pointerEvents={menuOpen ? 'none' : 'auto'}>
                <View style={styles.menuHandleBar} />
                <View style={styles.menuHandleShort} />
                <TouchableOpacity
                    style={RNStyleSheet.absoluteFill}
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
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    centerGroup: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    wordContainer: {
        width: '30%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 26,
        paddingHorizontal: 20,
        paddingVertical: 0,
        marginBottom: 18,
    },
    answersBox: {
        width: '50%',
        borderRadius: 28,
        borderWidth: 6,
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 32,
        paddingVertical: 5,
        alignItems: 'center',
        minHeight: 180,
        justifyContent: 'center',
    },
    
    centerContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 24,
    },
    card: {
        width: width * 0.92,
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        elevation: 4,
    },
    wordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    wordBox: {
        backgroundColor: '#F6FFF0',
        borderRadius: 18,
        paddingHorizontal: 24,
        paddingVertical: 8,
        marginRight: 10,
    },
    wordText: {
        fontSize: 26,
        fontFamily: 'PermanentMarker',
        color: '#7CB518',
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    mascot: {
        width: 70,
        height: 80,
        marginLeft: 0,
        marginTop: -10,
    },
    optionsContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
        maxHeight: '100%',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.65)',
        borderRadius: 36,
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginBottom: 10,
        minHeight: 44,
        width: '100%',
    },
    optionSelected: {
        backgroundColor: '#e6f4ce', // Green shade from the picture
        width: '100%',
        minHeight: 44,
    },
    optionCorrect: {
        backgroundColor: '#e6f4ce', // Green shade from the picture
        width: '100%',
        minHeight: 44,
    },
    optionIncorrect: {
        backgroundColor: 'rgba(255,230,230,0.7)', // Only backgroundColor!
        width: '100%',
        minHeight: 44,
    },
    optionCorrectTop: {
        borderLeftColor: '#7ca11f',
    },
    optionText: {
        fontSize: 20,
        color: '#4AC0E0',
        marginLeft: 14,
        fontWeight: 'bold',
        fontFamily: 'PermanentMarker',
    },
    optionTextSelected: {
        color: '#7ca11f', // Dark green for selected text
    },
    optionTextCorrect: {
        color: '#7ca11f',
        fontWeight: 'bold',
    },
    optionTextCorrectTop: {
        color: '#7ca11f',
        fontWeight: 'bold',
    },
    optionTextIncorrectBlink: {
        color: '#b22222',
        fontWeight: 'bold',
    },
    optionTextCorrectBlink: {
        color: '#7ca11f',
        fontWeight: 'bold',
    },
    radio: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 6,
        borderColor: '#AEE6FF', // red for incorrect, green for correct, etc.
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white', // always white or transparent
    },
    radioSelected: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 6,
        borderColor: '#c6e48b', // Green border for selected radio
    },
    radioCorrect: {
        borderColor: '#c6e48b',
    },
    radioIncorrect: {
        borderColor: '#FF6B6B',
    },
    radioDot: {
        width: 0,
        height: 0,
        borderRadius: 0,
        backgroundColor: 'transparent', // No dot for selected radio
    },
    checkMark: {
        color: '#7ca11f',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: -7,
    },
    feedbackSection: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    feedbackAnimation: {
        width: 90,
        height: 90,
        marginBottom: 4,
    },
    correctText: {
        fontSize: 20,
        color: '#7CB518',
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    incorrectText: {
        fontSize: 20,
        color: '#FF6B6B',
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    extraInfoContainer: {
        width: '100%',
    },
    infoPill: {
        backgroundColor: '#E3F0FF',
        borderRadius: 14,
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoPillLabel: {
        color: '#3686B7',
        fontWeight: 'bold',
        marginRight: 8,
        fontSize: 14,
    },
    infoPillText: {
        color: '#3686B7',
        fontSize: 14,
        flexShrink: 1,
    },

    infoLinesContainer: {
        width: '100%',
        alignItems: 'center',
    },
    infoLine: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        minHeight: 68,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 36,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    infoLabelPill: {
        backgroundColor: '#8decef',
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginRight: 12,
        minWidth: 70,
        minHeight: 50, //'50%'
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabelText: {
        color: 'white',
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
    
    sendButton: {
        marginTop: '-1%',
        marginBottom: '2%',
        width: '22%',
        backgroundColor: '#B6D94C',
        borderRadius: 45,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#B6D94C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
    nextButton: {
        marginTop: '-1%',
        marginBottom: '2%',
        width: '22%',
        backgroundColor: '#B6D94C',
        borderRadius: 45,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#B6D94C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        fontFamily: 'PermanentMarker',
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
    radioCross: {
        color: '#FF6B6B',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: -7,
        backgroundColor: 'transparent', // ensure no background
    },
});

export default VocabularyScreen;
