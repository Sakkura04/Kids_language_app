import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, Dimensions, Animated, Alert } from 'react-native';
import config from '../config';

const { width, height } = Dimensions.get('window');

const PronunciationTransitionScreen = ({ route, navigation }) => {
  const { audioBase64, currentWord } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Define the image sequence
  const imageSequence = [
    require('../../assets/images/flight1.png'),
    require('../../assets/images/flight2.png'),
    require('../../assets/images/flight3.png'),
    require('../../assets/images/flight2.png'),
    require('../../assets/images/flight4.png'),
    require('../../assets/images/flight5.png'),
    require('../../assets/images/flight6.png'),
    require('../../assets/images/flight5.png'),
    require('../../assets/images/flight1.png'),
    require('../../assets/images/flight2.png'),
    require('../../assets/images/flight3.png'),
    require('../../assets/images/flight2.png'),
    require('../../assets/images/flight7.png'),
    require('../../assets/images/flight8.png'),
    require('../../assets/images/flight9.png'),
    require('../../assets/images/flight8.png'),
  ];

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Image animation sequence
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageSequence.length);
    }, 200); // Change image every 200ms for smooth animation

    // Send request to backend for analysis
    const analyzePronunciation = async () => {
      try {
        const response = await fetch(`${config.backendUrl}/analyze-pronunciation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio: audioBase64,
            word: currentWord,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }

        const responseData = await response.json();
        
        // Navigate back to PronunciationScreen with feedback data
        navigation.navigate('Pronunciation', { showFeedback: true, feedbackData: responseData });
      } catch (error) {
        console.error('Error analyzing pronunciation:', error);
        Alert.alert('Error', `Failed to analyze pronunciation: ${error.message}`);
        // Navigate back to PronunciationScreen without feedback data
        navigation.navigate('Pronunciation', { showFeedback: false });
      }
    };

    // Start analysis after animation
    const timeout = setTimeout(() => {
      analyzePronunciation();
    }, 1000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(imageInterval);
    };
  }, [fadeAnim, navigation, audioBase64, currentWord]);

  return (
    <ImageBackground
      source={require('../../assets/images/transback.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Animated.View style={[styles.centerContent, { opacity: fadeAnim }]}> 
        <Image 
          source={imageSequence[currentImageIndex]}
          style={styles.birdImage} 
          resizeMode="contain" 
        />
        <Text style={[styles.label, { color: '#E88B8B' }]}>ANALYZING</Text>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  birdImage: {
    width: width * 0.18,
    height: width * 0.18,
    marginRight: 12,
  },
  label: {
    fontSize: width * 0.10 * 0.6,
    fontFamily: 'PermanentMarker',
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
});

export default PronunciationTransitionScreen;
