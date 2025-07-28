import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ImageBackground, Dimensions } from 'react-native';
import { Card, Title } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';

const ResultsScreen = ({ route }) => {
  const defaultResponseData = {
    transcription: 'N/A',
    readability_metrics: {
      'N/A': {
        'Metric 1': 'N/A',
        'Metric 2': 'N/A',
      },
    },
    word_complexities: {
      'N/A': 'N/A',
    },
    levenshtein_distance: 'N/A',
    missed_keywords: ['N/A'],
    new_keywords: ['N/A'],
  };

  const { responseData = defaultResponseData } = route.params || {};
  const [animate, setAnimate] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setAnimate(true);
      return () => setAnimate(false);
    }, [])
  );

  return (
    <View style={styles.background}>
    
      <LottieView
        source={require('../../assets/animations/colorful-background.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {animate && (
          <View style={styles.grid}>
            <View style={styles.row}>
              <Animatable.View animation="fadeInUp" delay={100} style={styles.squareContainer}>
                <Card style={styles.squareCard}>
                  <Card.Content>
                    <Title style={styles.title}>Transcription</Title>
                    <Text style={styles.contentText}>{responseData?.transcription}</Text>
                  </Card.Content>
                </Card>
              </Animatable.View>
              <Animatable.View animation="fadeInUp" delay={200} style={styles.squareContainer}>
                <Card style={styles.squareCard}>
                  <Card.Content>
                    <Title style={styles.title}>Readability Metrics</Title>
                    {Object.entries(responseData?.readability_metrics).map(([sentence, metrics]) => (
                      <View key={sentence} style={styles.metricContainer}>
                        <Text style={styles.sentence}>{sentence}</Text>
                        {Object.entries(metrics).map(([metric, value]) => (
                          <Text key={metric} style={styles.contentText}>{`${metric}: ${value}`}</Text>
                        ))}
                      </View>
                    ))}
                  </Card.Content>
                </Card>
              </Animatable.View>
            </View>
            <View style={styles.row}>
              <Animatable.View animation="fadeInUp" delay={300} style={styles.squareContainer}>
                <Card style={styles.squareCard}>
                  <Card.Content>
                    <Title style={styles.title}>Word Complexities</Title>
                    {Object.entries(responseData?.word_complexities).map(([word, complexity]) => (
                      <Text key={word} style={styles.contentText}>{`${word}: ${complexity}`}</Text>
                    ))}
                  </Card.Content>
                </Card>
              </Animatable.View>
              <Animatable.View animation="fadeInUp" delay={400} style={styles.squareContainer}>
                <Card style={styles.squareCard}>
                  <Card.Content>
                    <Title style={styles.title}>Additional Information</Title>
                    <Text style={styles.contentText}>Levenshtein Distance: {responseData?.levenshtein_distance}</Text>
                    <Text style={styles.contentText}>Missed Keywords: {responseData?.missed_keywords.join(", ")}</Text>
                    <Text style={styles.contentText}>New Keywords: {responseData?.new_keywords.join(", ")}</Text>
                  </Card.Content>
                </Card>
              </Animatable.View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: Dimensions.get('window').width, // Ensure the background covers the full width
    height: Dimensions.get('window').height, // Ensure the background covers the full height
    resizeMode: 'cover',
  },
  lottie: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 80, // To prevent content from being hidden by bottom tabs
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  cardContainer: {
    // unused now
  },
  grid: {
    width: '100%',
    maxHeight: '50%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
    gap: 30,
  },
  squareContainer: {
    flex: 1,
    aspectRatio: 1,
    width: '35%',
    maxHeight: '80%',
    marginHorizontal: 4,
  },
  squareCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)', // half transparent
    borderRadius: 20,
    elevation: 0, // remove shadow (Android)
    shadowColor: 'transparent', // remove shadow (iOS)
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  title: {
    fontSize: 22,
    color: '#48b2d0',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
  },
  sentence: {
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 5,
  },
  metricContainer: {
    marginBottom: 10,
  },
});

export default ResultsScreen;
