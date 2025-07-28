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
          <>
            <Animatable.View animation="fadeInUp" style={styles.header}>
              <Text style={styles.headerText}>Analysis Results</Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={100} style={styles.cardContainer}>
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.title}>Transcription</Title>
                  <Text style={styles.contentText}>{responseData?.transcription}</Text>
                </Card.Content>
              </Card>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={200} style={styles.cardContainer}>
              <Card style={styles.card}>
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

            <Animatable.View animation="fadeInUp" delay={300} style={styles.cardContainer}>
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.title}>Word Complexities</Title>
                  {Object.entries(responseData?.word_complexities).map(([word, complexity]) => (
                    <Text key={word} style={styles.contentText}>{`${word}: ${complexity}`}</Text>
                  ))}
                </Card.Content>
              </Card>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={400} style={styles.cardContainer}>
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.title}>Additional Information</Title>
                  <Text style={styles.contentText}>Levenshtein Distance: {responseData?.levenshtein_distance}</Text>
                  <Text style={styles.contentText}>Missed Keywords: {responseData?.missed_keywords.join(", ")}</Text>
                  <Text style={styles.contentText}>New Keywords: {responseData?.new_keywords.join(", ")}</Text>
                </Card.Content>
              </Card>
            </Animatable.View>
          </>
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
    width: '100%',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  title: {
    fontSize: 22,
    color: '#3143e8',
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
