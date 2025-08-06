import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import { Button } from 'react-native-paper';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

const PronunciationFeedbackModal = ({ visible, onClose, feedbackData }) => {
    const { transcription, feedback, feedback_sentence, correct_audio, segment_audios } = feedbackData;

    const playAudio = async (base64Audio) => {
        try {
            const path = `${RNFS.CachesDirectoryPath}/temp_audio_${Date.now()}.wav`;
            await RNFS.writeFile(path, base64Audio, 'base64');

            const sound = new Sound(path, '', (error) => {
                if (error) {
                    console.log('Failed to load the sound', error);
                    Alert.alert('Error', 'Failed to load audio.');
                    return;
                }
                sound.play(() => {
                    sound.release();
                    // Remove the temporary file after playback
                    RNFS.unlink(path).catch((err) => console.log('Failed to delete temp audio', err));
                });
            });
        } catch (error) {
            console.error('Error playing audio:', error);
            Alert.alert('Error', 'Failed to play audio.');
        }
    };

    // Calculate success percentage
    const correctCount = feedback.filter(item => item.status === 'correct').length;
    const totalCount = feedback.length;
    const successPercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <ImageBackground
                source={require('../../assets/images/sky.jpeg')}
                style={styles.modalBackground}
                resizeMode="cover"
            >
                <View style={styles.modalView}>
                    <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                        <Text style={styles.closeIconText}>✕</Text>
                    </TouchableOpacity>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.title}>AWESOME JOB!</Text>
                        <Text style={styles.subtitle}>HOW DID YOU DO IT?</Text>
                        
                        {/* Feedback rows */}
                        {feedback.map((item, index) => (
                            <View key={index} style={styles.feedbackRow}>
                                <Text style={styles.segmentText}>{item.segment}</Text>
                                
                                {/* Egg icon */}
                                <View style={styles.iconContainer}>
                                    {item.status === 'correct' ? (
                                        <View style={styles.Eggs}>
                                            <ImageBackground
                                                source={require('../../assets/images/correct.png')}
                                                style={styles.correctegg}
                                                resizeMode="cover"
                                            ></ImageBackground>
                                        </View>
                                    ) : (
                                        <View style={styles.Eggs}>
                                            <ImageBackground
                                                source={require('../../assets/images/incorrect.png')}
                                                style={styles.incorrectegg}
                                                resizeMode="cover"
                                            ></ImageBackground>
                                        </View>
                                    )}
                                </View>
                                
                                <Text style={[
                                    styles.statusText,
                                    item.status === 'correct' ? styles.correctText : styles.incorrectText
                                ]}>
                                    {item.status === 'correct' ? 'CORRECT!' : 'INCORRECT!'}
                                </Text>
                                
                                <TouchableOpacity
                                    onPress={() => playAudio(segment_audios[item.segment])}
                                >
                                <ImageBackground
                                    source={require('../../assets/images/headphones.png')}
                                    style={styles.headphoneIcon}
                                    resizeMode="cover"
                                ></ImageBackground>
                                </TouchableOpacity>
                            </View>
                        ))}
                        
                        {/* Success section */}
                        <View style={styles.successSection}>
                            <Text style={styles.successTitle}>YOUR SUCCESS!</Text>
                            <View style={styles.progressBarContainer}>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${successPercentage}%` }]} />
                                </View>
                                <Text style={styles.percentageText}>{successPercentage}%</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </ImageBackground>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: '75%',
        backgroundColor: 'rgba(61, 151, 187, 0.8)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    scrollContent: {
        alignItems: 'center',
        // width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'white',
        textAlign: 'center',
        fontFamily: 'PermanentMarker',
    },
    subtitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
        color: '#8decef',
        fontFamily: 'PermanentMarker',
    },
    feedbackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '95%',
        height: '18%',
        //backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 3,
        borderRadius: 30,
        paddingHorizontal: '6%',
        marginBottom: '2%',
        justifyContent: 'space-between',
    },
    segmentText: {
        fontSize: 25,
        color: 'white',
        fontWeight: 'bold',
        flex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    Eggs: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    correctegg: {
        width: 55,
        height: 50,
    },
    
    incorrectegg: {
        width: 65,
        height: 50,
    },


    statusText: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    correctText: {
        color: '#d4e273',
    },
    incorrectText: {
        color: '#FDA4A4',
    },
    headphoneIcon: {
        width: 60,
        height: 54,
        position: 'relative',
    },
    successSection: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
        fontFamily: 'PermanentMarker',
    },
    progressBarContainer: {
        width: '115%',
        alignItems: 'center',
        position: 'relative',
        marginTop: 5,
        marginBottom: 15,
    },
    
    progressBar: {
        width: '82%',
        height: 45,
        marginBottom: 10,
        backgroundColor: '#8DECEF',
        borderRadius: 20,
        justifyContent: 'center',
    },
    
    progressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 20,
        position: 'absolute',
        left: 0,
        top: 0,
    },
    
    percentageText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A90E2',
        padding: 5,
        textAlign: 'right',
        width: '80%',
        position: 'absolute',
        zIndex: 1,
    },
    
    closeIcon: {
        position: 'absolute',
        right: 20,
        top: 7,
        zIndex: 10,
    },
    
    closeIconText: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
    },
    
});

export default PronunciationFeedbackModal;
