import { useState, useEffect } from 'react';

const useWordDetails = (word, wordDetailsData) => {
    const [wordDetails, setWordDetails] = useState(null);
    const [wordImage, setWordImage] = useState(null);

    useEffect(() => {
        if (word) {
            const details = wordDetailsData[word];
            if (details) {
                setWordDetails({
                    meaning: details.meaning,
                    pronunciation: details.pronunciation,
                });
                setWordImage(details.image);
            } else {
                setWordDetails({
                    meaning: 'No details available.',
                    pronunciation: '',
                });
                setWordImage(null);
            }
        }
    }, [word]);

    const playPronunciation = () => {
        console.log(`Playing pronunciation for ${word}`);
    };

    return { wordDetails, wordImage, playPronunciation };
};

export default useWordDetails;
