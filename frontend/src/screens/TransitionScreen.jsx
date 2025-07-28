import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, Dimensions, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

const NAV_MAP = {
  RECORD: 'Record',
  LEARN: 'Vocabulary',
  PRONOUNCE: 'Pronunciation',
};

const TransitionScreen = ({ route, navigation }) => {
  const { label, image, color } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      const navTarget = NAV_MAP[label.toUpperCase()] || 'Home';
      navigation.replace(navTarget);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [fadeAnim, label, navigation]);

  return (
    <ImageBackground
      source={require('../../assets/images/transback.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Animated.View style={[styles.centerContent, { opacity: fadeAnim }]}> 
        <Image source={image} style={styles.birdImage} resizeMode="contain" />
        <Text style={[styles.label, { color }]}>{label}</Text>
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
    width: width * 0.18, // smaller
    height: width * 0.18,
    marginRight: 12,
  },
  label: {
    fontSize: width * 0.10 * 0.6, // smaller
    fontFamily: 'PermanentMarker',
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: '#fff',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
});

export default TransitionScreen; 