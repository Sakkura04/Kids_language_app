import { useState, useEffect } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = new AudioRecorderPlayer();

const useWordDetails = (word) => {
    const [wordDetails, setWordDetails] = useState({
        phonetics: [],
        meanings: [],
        examples: [],
        antonyms: []
    });
    const [wordImage, setWordImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (word) {
            fetchWordDetails(word);
            fetchImage(word);
        }
    }, [word]);

    const fetchWordDetails = async (word) => {
        setLoading(true);
        try {
            const dictionaryApiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
            const linguaRobotApiUrl = `https://lingua-robot.p.rapidapi.com/language/v1/entries/en/${word}`;

            let dictionaryData = [];
            let linguaRobotData = {};

            // Fetch from Dictionary API
            try {
                const response = await fetch(dictionaryApiUrl);
                dictionaryData = await response.json();
            } catch (error) {
                console.error("Failed to fetch from Dictionary API:", error);
            }

            // Fetch from Lingua Robot API
            try {
                const response = await fetch(linguaRobotApiUrl, {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-host': 'lingua-robot.p.rapidapi.com',
                        'x-rapidapi-key': 'your-rapidapi-key-here',
                    },
                });
                linguaRobotData = await response.json();
            } catch (error) {
                console.error("Failed to fetch from Lingua Robot API:", error);
            }

            const combinedData = combineApiResponse([dictionaryData, linguaRobotData]);
            setWordDetails(combinedData);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchImage = async (word) => {
        const unsplashApiUrl = `https://api.unsplash.com/search/photos?page=1&query=${word}&client_id=your-unsplash-client-id`;

        try {
            const response = await fetch(unsplashApiUrl);
            const jsonData = await response.json();

            if (jsonData.results && jsonData.results.length > 0) {
                setWordImage(jsonData.results[0].urls.small);
            } else {
                setWordImage(null);
            }
        } catch (error) {
            console.error("Failed to fetch image:", error);
        }
    };

    const combineApiResponse = (data) => {
        let phonetics = [];
        let meanings = [];
        let examples = [];
        let antonyms = [];

        data.forEach(apiData => {
            if (Array.isArray(apiData) && apiData[0]) {
                const dictionaryData = apiData[0];

                if (dictionaryData.phonetics) {
                    phonetics = phonetics.concat(dictionaryData.phonetics).slice(0, 2);
                }

                if (dictionaryData.meanings) {
                    meanings = meanings.concat(dictionaryData.meanings.map(meaning => ({
                        partOfSpeech: meaning.partOfSpeech,
                        definitions: meaning.definitions ? meaning.definitions.slice(0, 2).map(def => ({
                            definition: def.definition,
                            example: def.example,
                        })) : [],
                        antonyms: meaning.antonyms ? meaning.antonyms.slice(0, 2) : [],
                    }))).slice(0, 2);

                    examples = examples.concat(dictionaryData.meanings.flatMap(meaning => meaning.definitions ? meaning.definitions.map(def => def.example).filter(ex => ex) : [])).slice(0, 2);

                    antonyms = antonyms.concat(dictionaryData.meanings.flatMap(meaning => meaning.antonyms ? meaning.antonyms : [])).slice(0, 2);
                }
            } else if (apiData.entries) {
                apiData.entries.forEach(entry => {
                    if (entry.lexemes) {
                        phonetics = phonetics.concat(entry.lexemes.flatMap(lexeme => lexeme.phoneticTranscriptions ? lexeme.phoneticTranscriptions.map(pt => ({ text: pt.transcription, audio: pt.audio.url })) : [])).slice(0, 2);

                        meanings = meanings.concat(entry.lexemes.map(lexeme => ({
                            partOfSpeech: lexeme.partOfSpeech,
                            definitions: lexeme.senses ? lexeme.senses.slice(0, 2).map(sense => ({
                                definition: sense.definition,
                                example: sense.usageExamples ? sense.usageExamples[0] : null,
                            })) : [],
                            antonyms: lexeme.senses ? lexeme.senses.flatMap(sense => sense.antonyms ? sense.antonyms.slice(0, 2) : []) : [],
                        }))).slice(0, 2);

                        examples = examples.concat(entry.lexemes.flatMap(lexeme => lexeme.senses ? lexeme.senses.flatMap(sense => sense.usageExamples ? sense.usageExamples.slice(0, 2) : []) : [])).slice(0, 2);

                        antonyms = antonyms.concat(entry.lexemes.flatMap(lexeme => lexeme.senses ? lexeme.senses.flatMap(sense => sense.antonyms ? sense.antonyms.slice(0, 2) : []) : [])).slice(0, 2);
                    }
                });
            }
        });

        return {
            phonetics: phonetics.slice(0, 2),
            meanings: meanings.slice(0, 2),
            examples: examples.slice(0, 2),
            antonyms: antonyms.slice(0, 2),
        };
    };

    const playPronunciation = async (audioUrl) => {
        try {
            const msg = await audioRecorderPlayer.startPlayer(audioUrl);
            audioRecorderPlayer.addPlayBackListener((e) => {
                if (e.current_position === e.duration) {
                    audioRecorderPlayer.stopPlayer();
                }
            });
            return msg;
        } catch (error) {
            console.error("Failed to play pronunciation:", error);
        }
    };

    return { wordDetails, wordImage, loading, error, playPronunciation };
};

export default useWordDetails;
