# Reading Help and Assessment

## Project Goals

This project aims to enhance reading education by leveraging the power of Natural Language Processing (NLP) and Machine Learning (ML). Our objectives include:

### Personalized Reading Support

- Develop an NLP-powered system that adapts to individual reading levels and subjects.
- Provide real-time assistance for comprehension and vocabulary enhancement.

### Innovative Assessment Methods

- Utilize ML models and NLP techniques to assess reading proficiency beyond traditional testing methods.
- Design unified evaluation metrics for comprehensive assessment.

### Inclusive Technology Integration

- Create engaging reading platforms tailored to each child's unique learning pace and style.
- Support diverse learning needs with inclusive digital tools.
- Focus on overcoming accessibility challenges for seamless educational integration.

## Features for Complexity Estimation

The complexity of a word is estimated using five features:

1. **Lemma Length**: The number of characters in the word's lemma (base form). Longer lemmas can sometimes indicate more complex words.

2. **Average Age-of-Acquisition**: The typical age at which a word enters a person's vocabulary. Words acquired at an older age are often more complex.

3. **Average Concreteness**: A score from 1 to 5, with 5 being very concrete. Concrete words are easier to understand and remember than abstract words.

4. **Frequency in a Certain Corpus**: How often the word appears in a specific corpus, such as the Corpus of Contemporary American English. Less frequent words are generally considered more complex.

5. **Lemma Frequency in a Certain Corpus**: The frequency of the word's lemma in a specific corpus. Like word frequency, lower lemma frequency can indicate higher complexity.

## Methodology


## System Overview

```plaintext
[ Data Collection ] -> [ Feature Engineering ] -> [ Model Training ]
       |                                                  |
       v                                                  v
[ Audio Processing & Transcription ]             [ Complexity Prediction ]
       |                                                  |
       v                                                  v
[ Word Complexity Estimation ] -> [ Readability Assessment ] -> [ Educational Integration ]
```

### Data Collection

Collect data on word complexity using the following resources:

- **Word Frequency**: The Corpus of Contemporary American English (Davies, 2008).
- **Age-of-Acquisition**: Age-of-acquisition ratings for 30,000 English words (Kuperman et al., 2012).
- **Word Concreteness**: Concreteness ratings for 40 thousand generally known English word lemmas (Brysbaert et al., 2013).

### Feature Engineering

1. Process the audio transcript to extract individual words.
2. For each word, calculate the features mentioned above using the collected data.
3. Normalize the features to ensure they are on a comparable scale, especially for machine learning model input.

### Model Training

1. Label a set of words with their difficulty levels based on grade (e.g., Grade 2, Grade 4, Grade 6), using educator input or existing educational standards.
2. Use the labeled dataset to train a machine learning model, selecting an algorithm that performs well on classification tasks (e.g., Random Forest, Gradient Boosting Machines, or Neural Networks).


### Implementation

- Integrate the trained model into an application that processes audio transcripts.
- For each processed transcript, use the model to identify words that are likely to be difficult for students at specific grade levels.
- Save the identified words, along with their difficulty levels and features, in a database for further educational use.

## References

- M Davies. 2008. The Corpus of Contemporary American English.
- V Kuperman et al. 2012. Age-of-acquisition ratings for 30,000 English words. Behavior Research Methods.
- M Brysbaert et al. 2013. Concreteness ratings for 40 thousand generally known English word lemmas. Behavior Research Methods.

d



# Data Links

https://github.com/ArtsEngine/concreteness





Intergrate this information into the README.md file.


Age of acquisition (AoA) was calculated for each word, but it provides some clues based on the methods and results sections. Here is a possible summary of the calculation method:

Data collection: The authors used the Amazon Mechanical Turk to collect AoA ratings for 30,121 English content words from 1,960 responders residing in the U.S. The responders were asked to enter the age (in years) at which they thought they had learned each word, or to enter “x” if they did not know the word. Each word list contained 300 target words, 10 calibrator words, and 52 control words.
Data trimming: The authors removed empty cells, invalid responses, and extreme outliers from the data set. They also excluded the lists that had a low correlation with the Bristol norms for the control words. The resulting data set comprised 696,048 valid ratings, of which 615,967 were numeric and 76,211 were “Don’t knows”.
Data analysis: The authors calculated the mean AoA ratings and standard deviations for each word, based on the numeric ratings only. They also reported the number of responders who gave numeric ratings and the number of responders who rated the word as unknown. They compared their ratings with other AoA norms and with the lexical decision data of the English Lexicon Project. They also discussed the effects of AoA on word recognition and vocabulary growth.



the words in each list are:

Target words: These are the words for which the authors wanted to collect age-of-acquisition (AoA) ratings from the participants. They are 30,121 English content words (nouns, verbs, and adjectives) that are generally known by at least 85% of the raters.
Calibrator words: These are 10 words that represent the entire range of the AoA scale, based on previous ratings. They are used to introduce the participants to the diversity of words that they could encounter and to help them calibrate their ratings. For example, some of the calibrator words are “shoe”, “insane”, and “hernia”.
Control words: These are 52 words that cover the entire AoA range and have existing ratings from other studies. They are randomly distributed over the word lists and are used to check the validity and reliability of the participants’ ratings. For example, some of the control words are “dog”, “honest”, and “deluge”.