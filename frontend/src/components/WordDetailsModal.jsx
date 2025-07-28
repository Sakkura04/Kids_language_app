import React from 'react';
import { Modal, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const WordDetailsModal = ({ visible, onClose, wordDetails, wordImage, word, playPronunciation }) => {
    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.wordTitle}>{word}</Text>
                    {wordImage && <Image source={{ uri: wordImage }} style={styles.wordImage} />}
                    <Text style={styles.meaningText}>Meaning: {wordDetails?.meaning}</Text>
                    <TouchableOpacity onPress={playPronunciation} style={styles.pronunciationButton}>
                        <Text style={styles.pronunciationText}>🔊 Listen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: '#000000AA',
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        margin: 20,
        padding: 20,
        borderRadius: 10,
    },
    wordTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    wordImage: {
        width: '100%',
        height: 150,
        marginBottom: 10,
    },
    meaningText: {
        fontSize: 18,
        marginBottom: 10,
    },
    pronunciationButton: {
        padding: 10,
        backgroundColor: '#1E90FF',
        borderRadius: 5,
        marginBottom: 10,
    },
    pronunciationText: {
        color: '#FFFFFF',
        textAlign: 'center',
    },
    closeButton: {
        padding: 10,
        backgroundColor: '#808080',
        borderRadius: 5,
    },
    closeText: {
        color: '#FFFFFF',
        textAlign: 'center',
    },
});

export default WordDetailsModal;
