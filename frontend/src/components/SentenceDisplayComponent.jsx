import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useWordDetails from '../hooks/useWordDetails';
import WordDetailsModal from './WordDetails';

const paragraphs = [
  "Once upon a time, in a land far away, there lived a young princess who loved to explore the forests around her castle. She would spend hours wandering among the trees, listening to the birds sing and watching the squirrels play.",
  "One sunny day, she found a small, sparkling stone on the ground. Curious, she picked it up and held it to the light. The stone began to glow, and suddenly, a tiny fairy appeared before her, thanking her for finding the lost magical gem.",
  "The princess and the fairy became friends, and together they embarked on many adventures, discovering hidden treasures and learning the secrets of the enchanted forest."
];

const wordDetailsData = {
  'princess': {
    meaning: 'A daughter of a monarch.',
    pronunciation: 'prin-sess',
    image: 'https://example.com/image-of-princess.jpg',
  },
  'forest': {
    meaning: 'A large area covered chiefly with trees and undergrowth.',
    pronunciation: 'for-est',
    image: 'https://example.com/image-of-forest.jpg',
  },
  // Add more words as needed
};

const SentenceDisplayComponent = ({ currentParagraph, setCurrentParagraph }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");

  const { wordDetails, wordImage, playPronunciation } = useWordDetails(selectedWord, wordDetailsData);

  const randomizeParagraph = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * paragraphs.length);
    } while (paragraphs[randomIndex] === currentParagraph);
    setCurrentParagraph(paragraphs[randomIndex]);
  };

  const handleWordPress = (word) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    setSelectedWord(cleanWord);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.paragraphContainer}>
        {currentParagraph.split(' ').map((word, index) => (
          <Text key={index} style={styles.word} onPress={() => handleWordPress(word)}>
            {word + ' '}
          </Text>
        ))}
      </View>
      <TouchableOpacity onPress={randomizeParagraph} style={styles.iconButton}>
        <Icon name="shuffle" size={30} color="white" />
      </TouchableOpacity>

      <WordDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        wordDetails={wordDetails}
        wordImage={wordImage}
        word={selectedWord}
        playPronunciation={playPronunciation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  paragraphContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 10,
  },
  word: {
    fontSize: 20,
    color: '#1E90FF',
    marginRight: 4,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 10,
    backgroundColor: '#FFA500',
    borderRadius: 50,
    marginTop: 10,
  },
});

export default SentenceDisplayComponent;
