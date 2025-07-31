import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, PanResponder, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { ScrollView} from 'react-native';

const { width, height } = Dimensions.get('window');
const MENU_CLOSED_Y = 45;
const MENU_HEIGHT = height * 0.51;
const MENU_ITEMS = [
  { label: 'Home', screen: 'Home' },
  { label: 'Results', screen: 'Results' },
  { label: 'Record', screen: 'Record' },
  { label: 'Vocabulary', screen: 'Vocabulary' },
  { label: 'Pronunciation', screen: 'Pronunciation' },
];

const BookScreen = () => {
  const navigation = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const translateY = useRef(new Animated.Value(MENU_HEIGHT - MENU_CLOSED_Y)).current;

  // Book selection state
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState(false);

  useEffect(() => {
    // Fetch books from backend
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://134.190.225.163:5000/get-books');
        const data = await response.json();
        setBooks(data.books || []);
        if (data.books && data.books.length > 0) {
          setSelectedBookId(data.books[0].book_id);
        }
      } catch (e) {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleChooseBook = async () => {
    if (!selectedBookId) return;
    
    setChoosing(true);
    try {
      const response = await fetch('http://134.190.225.163:5000/select-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book_id: selectedBookId }),
      });
      
      if (response.ok) {
        console.log('Book selected successfully');
        // Navigate to Record screen with selected book info
        const selectedBook = books.find(b => b.book_id === selectedBookId);
        navigation.replace('Record', { 
          selectedBookId: selectedBookId,
          selectedBookName: selectedBook?.name 
        });
      } else {
        console.error('Failed to select book');
      }
    } catch (error) {
      console.error('Error selecting book:', error);
    } finally {
      setChoosing(false);
    }
  };

  const bgColor = translateY.interpolate({
    inputRange: [0, MENU_HEIGHT - MENU_CLOSED_Y],
    outputRange: ['#3686B7', '#fff'],
  });

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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
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

  return (
    <ImageBackground
      source={require('../../assets/images/sky.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
    {/* Main content */}
    <View style={styles.overlayFrame}>
    <View style={styles.innerBox}>
      <Text style={styles.title}>Books :)</Text>

      {loading ? (
         <ActivityIndicator size="large" color="#3686B7" />
      ) : books.length === 0 ? (
        <Text style={styles.bookText}>No books found.</Text>
      ) : (
        <>
          <View style={styles.bookList}>
            <ScrollView>
              {books.map(book => (
                <TouchableOpacity
                  key={book.book_id}
                  onPress={() => setSelectedBookId(book.book_id)}
                  style={{
                    padding: 10,
                    backgroundColor: selectedBookId === book.book_id ? '#00a0cd' : 'transparent',
                    borderRadius: 20,
                    margin: 2,
                  }}
                >
                  <Text style={{ color: selectedBookId === book.book_id ? 'white' : 'rgba(0, 160, 205, 0.7)', fontSize: 18 }}>
                  {book.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
                      
          <View style={styles.penguinContainer}>
            <ImageBackground
               source={require('../../assets/images/bookscreen.png')}
               style={styles.penguinImage}
               resizeMode="contain"
            />
          </View>
        </>
        )}
    </View>
      <TouchableOpacity
        style={[
          styles.chooseButton,
          (!selectedBookId || choosing) && styles.chooseButtonDisabled
        ]}
        onPress={handleChooseBook}
        disabled={!selectedBookId || choosing}
        >
        {choosing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
           <Text style={styles.chooseButtonText}>CHOOSE</Text>
        )}
      </TouchableOpacity>
    </View>


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
  header: {
    width: '100%',
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 30,
  },
  headerText: {
    fontFamily: 'PermanentMarker',
    fontSize: 20,
    color: '#3686B7',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontFamily: 'PermanentMarker',
    fontSize: 24,
    color: '#3686B7',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: {
    fontFamily: 'PermanentMarker',
    fontSize: 22,
    color: '#3686B7',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },

  overlayFrame: {
    position: 'absolute',
    top: '17%',
    width: '55%',
    height: '70%',
    borderWidth: 5,
    borderColor: 'white',
    borderRadius: 30,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },  
  
  innerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    width: '90%',
    height: '80%',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  
  title: {
    fontFamily: 'PermanentMarker',
    fontSize: 22,
    color: '#fff', // білий текст
    fontWeight: 'bold', // жирний
    textAlign: 'center', // по центру
    marginBottom: 16,
    textTransform: 'uppercase',
    backgroundColor: '#B0CE92',
    width: '95%',
    padding: 8,
    borderRadius: 25,
  },
  
  
  bookList: {
    width: '95%',
    flex: 1,
    borderWidth: 2,
    borderColor: '#00a0cd',
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  
  penguinContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 120, // збільшено
    height: 80, // збільшено
  },
  
  penguinImage: {
    width: '100%',
    height: '100%',
  },
  
  pickerContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#AEE6FF',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  pickerItem: {
    fontFamily: 'PermanentMarker',
    fontSize: 20,
    color: '#3686B7',
  },
  chooseButton: {
    backgroundColor: 'rgba(0, 160, 205, 0.8)', // прозорість 80%
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  
  chooseButtonDisabled: {
    backgroundColor: '#ccc',
  },
  chooseButtonText: {
    fontFamily: 'PermanentMarker',
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  // Pull-up menu styles (reuse from HomeScreen)
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
});


export default BookScreen;