import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Dimensions, ImageBackground, Image, Animated, PanResponder, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { interpolateColor } from 'react-native-reanimated'; // not available, so use Animated interpolation workaround

const { width, height } = Dimensions.get('window');
const isTablet = width >= 700;

const CARD_WIDTH = isTablet ? width * 0.42 : width * 0.72;
const CARD_HEIGHT = isTablet ? 130 : 100;
const CARD_MARGIN = isTablet ? 8 : 4;

const MENU_CLOSED_Y = 45;
const MENU_HEIGHT = height * 0.51;
const MENU_ITEMS = [
  { label: 'Home', screen: 'Home' },
  { label: 'Results', screen: 'Results' },
  { label: 'Record', screen: 'Record' },
  { label: 'Book', screen: 'Book' }, 
  { label: 'Vocabulary', screen: 'Vocabulary' },
  { label: 'Pronunciation', screen: 'Pronunciation' },
];

const CARD_DATA = [
  {
    label: 'RECORD',
    nav: 'Record',
    image: require('../../assets/images/bluebirdbutton.png'),
    transition: { label: 'RECORD', image: require('../../assets/images/transblue.png'), color: '#4A90E2' },
    color: '#4A90E2',
  },
  {
    label: 'LEARN',
    nav: 'Vocabulary',
    image: require('../../assets/images/greenbirdbutton.png'),
    transition: { label: 'LEARN', image: require('../../assets/images/transgreen.png'), color: '#A3C76D' },
    color: '#A3C76D',
  },
  {
    label: 'PRONOUNCE',
    nav: 'Pronunciation',
    image: require('../../assets/images/redbirdbutton.png'),
    transition: { label: 'PRONOUNCE', image: require('../../assets/images/transred.png'), color: '#E88B8B' },
    color: '#E88B8B',
  },
];

const HomeScreen = ({ navigation }) => {
  // Pull-up menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const translateY = useRef(new Animated.Value(MENU_HEIGHT - MENU_CLOSED_Y)).current;

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
      useNativeDriver: false, // must be false for color interpolation
    }).start();
  };
  const closeMenu = () => {
    Animated.timing(translateY, {
      toValue: MENU_HEIGHT - MENU_CLOSED_Y,
      duration: 350,
      useNativeDriver: false, // must be false for color interpolation
    }).start(() => setMenuOpen(false));
  };

  // PanResponder for drag
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Clamp so menu never goes below closed state
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

  // Animated values for button scale and position
  const buttonScale = translateY.interpolate({
    inputRange: [0, MENU_HEIGHT - MENU_CLOSED_Y],
    outputRange: [0.7, 1],
    extrapolate: 'clamp',
  });
  const buttonTranslateY = translateY.interpolate({
    inputRange: [0, MENU_HEIGHT - MENU_CLOSED_Y],
    outputRange: [-180, 0], // move up by 180px when menu is fully open
    extrapolate: 'clamp',
  });

  return (
    <ImageBackground
      source={require('../../assets/images/sky.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <Animated.View
        style={{
          transform: [
            { scale: buttonScale },
            { translateY: buttonTranslateY },
          ],
        }}
      >
        <View style={styles.cardsContainer}>
          {CARD_DATA.map((card) => {
            const animRef = useRef(null);
            return (
              <TouchableWithoutFeedback
                key={card.label}
                onPressIn={() => animRef.current && animRef.current.animate({ 0: { scale: 1 }, 1: { scale: 1.08 } }, 120)}
                onPressOut={() => animRef.current && animRef.current.animate({ 0: { scale: 1.08 }, 1: { scale: 1 } }, 120)}
                onPress={() => navigation.navigate('Transition', card.transition)}
              >
                <Animatable.View
                  ref={animRef}
                  style={styles.card}
                  useNativeDriver
                >
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardLabel, { color: card.color }]}>{card.label}</Text>
                    <Image source={card.image} style={styles.birdImage} resizeMode="contain" />
                  </View>
                </Animatable.View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>
      </Animated.View>
      {/* Pull-up menu handle */}
      <View style={styles.menuHandleBarContainer} pointerEvents={menuOpen ? 'none' : 'auto'}>
        <View style={styles.menuHandleBar} />
        <View style={styles.menuHandleShort} />
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
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
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
    zIndex: 0,
  },
  cardsContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 24,
    marginVertical: CARD_MARGIN,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 28 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  birdImage: {
    width: isTablet ? CARD_HEIGHT * 1.1 : CARD_HEIGHT * 1.1,
    height: isTablet ? CARD_HEIGHT * 1.1 : CARD_HEIGHT * 1.1,
    marginLeft: 8,
  },
  cardLabel: {
    fontSize: isTablet ? 24 : 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    fontFamily: 'PermanentMarker',
    marginLeft: 8,
  },
  // Pull-up menu styles
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
    backgroundColor: 'rgb(255, 255, 255)', // half-transparent white
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  menuHandleShort: {
    width: 60,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#AEE6FF', // short light blue line
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
    backgroundColor: '#AEE6FF', // light blue line
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
    color: '#AEE6FF', // light blue text for opened menu
    letterSpacing: 1.5,
  },
});

export default HomeScreen;
