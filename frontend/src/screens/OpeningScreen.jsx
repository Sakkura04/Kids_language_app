import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ImageBackground, Dimensions, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

const OpeningScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    const timeout = setTimeout(() => {
      navigation.replace('Home');
    }, 1500);
    return () => clearTimeout(timeout);
  }, [fadeAnim, navigation]);

  return (
    <ImageBackground
      source={require('../../assets/images/sky.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <Animated.View style={[styles.centerContent, { opacity: fadeAnim }]}> 
        <Image
          source={require('../../assets/images/openingscreen.png')}
          style={styles.openingImage}
          resizeMode="contain"
        />
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
    zIndex: 0,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  openingImage: {
    width: width * 0.38,
    height: width * 0.38,
  },
});

export default OpeningScreen; 