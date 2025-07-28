import React from 'react';
import { View, Text, Modal, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const WordDetailsModal = ({ visible, onClose, wordDetails, wordImage, word, playPronunciation }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalView}>
                <ScrollView style={styles.scrollView}>
                    <Text style={styles.modalTextTitle}>{word.toUpperCase()}</Text>

                    {wordImage && (
                        <Image source={{ uri: wordImage }} style={styles.wordImage} />
                    )}
                    {wordDetails.meanings?.map((meaning, index) => (
                        <View key={index} style={styles.meaningContainer}>
                            <Text style={styles.modalText}>Part of Speech: {meaning.partOfSpeech}</Text>
                            {meaning.definitions?.map((def, idx) => (
                                <View key={idx}>
                                    <Text style={styles.definitionText}>Definition: {def.definition}</Text>
                                    {def.example && (
                                        <Text style={styles.exampleText}>Example: {def.example}</Text>
                                    )}
                                </View>
                            ))}
                            {wordDetails.antonyms?.length > 0 && (
                                <View style={styles.antonymsContainer}>
                                    <Text style={styles.modalText}>Antonyms:</Text>
                                    <ScrollView horizontal={true}>
                                        {wordDetails.antonyms.map((antonym, idx) => (
                                            <View key={idx} style={styles.antonymBox}>
                                                <Text style={styles.antonymText}>{antonym}</Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    ))}

                    {wordDetails.phonetics?.length > 0 && (
                        <TouchableOpacity
                            style={styles.buttonPlay}
                            onPress={() => playPronunciation(wordDetails.phonetics[0].audio)}
                        >
                            <Icon name="volume-up" size={24} color="white" />
                            <Text style={styles.textStyle}>Play Pronunciation</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
                <TouchableOpacity
                    style={styles.buttonClose}
                    onPress={onClose}
                >
                    <Text style={styles.textStyle}>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    scrollView: {
        marginBottom: 10,
    },
    modalTextTitle: {
        marginBottom: 10,
        textAlign: "center",
        fontSize: 24,
        fontWeight: "bold",
    },
    wordImage: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    meaningContainer: {
        marginTop: 5,
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    definitionText: {
        marginBottom: 15,
        textAlign: "center",
        color: '#333',
    },
    buttonPlay: {
        marginTop: 10,
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    buttonClose: {
        backgroundColor: "#2196F3",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    exampleText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        fontStyle: 'italic',
    },
    antonymsContainer: {
        marginTop: 5,
    },
    antonymBox: {
        marginRight: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    antonymText: {
        color: '#333',
        fontSize: 14,
    },
});

export default WordDetailsModal;
