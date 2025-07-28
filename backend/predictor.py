import whisper
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.tree import DecisionTreeRegressor
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_squared_error
from pydub import AudioSegment
from preprocessor import WordPreprocessor
import Levenshtein as lev
import re
import textstat
import base64
import os
import nltk
from nltk.metrics import distance

# Constants for file paths and settings
MODEL_FILENAME_TEMPLATE = "model_{}.pickle"
TRAINING_CSV_FILENAME = "data/training_data.csv"

class WordComplexityPredictor:
    def __init__(self, debug=False):
        self._preprocessor = WordPreprocessor()
        self._debug = debug
        self.transcription = None
        self.models = {
            "decision_tree": DecisionTreeRegressor(max_depth=4),
            "linear_regression": LinearRegression(),
            "random_forest": RandomForestRegressor(n_estimators=100),
            "gradient_boosting": GradientBoostingRegressor(n_estimators=100),
            "svr": SVR(),
        }
        self.model_scores = {}
        self._train_and_save_models(TRAINING_CSV_FILENAME)

    def _train_and_save_models(self, train_csv):
        training_data = pd.read_csv(train_csv)
        X = np.vstack(
            [
                self._preprocessor.get_feature_vector(row["word"])
                for _, row in training_data.iterrows()
            ]
        )
        y = np.array(training_data["label"])

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        for name, model in self.models.items():
            model.fit(X_train, y_train)
            predictions = model.predict(X_test)
            mse = mean_squared_error(y_test, predictions)
            self.model_scores[name] = np.sqrt(mse)
            with open(MODEL_FILENAME_TEMPLATE.format(name), "wb") as f:
                pickle.dump(model, f)
            self._log(
                f"Trained and saved {name} model with RMSE: {self.model_scores[name]}"
            )

    def predict(self, word, model_name="decision_tree"):
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not found.")
        model = self.models[model_name]
        features = self._preprocessor.get_feature_vector(word)
        pred = model.predict(features)[0]
        self._log(f'Predicted "{word}" with complexity {pred} using {model_name}.')
        return float(pred)

    def _log(self, message):
        if self._debug:
            print(message)

    # New Method: Convert MP3 to WAV
    def convert_mp3_to_wav(self, mp3_file_path, wav_file_path):
        audio = AudioSegment.from_mp3(mp3_file_path)
        audio.export(wav_file_path, format="wav")
        self._log(f"Converted {mp3_file_path} to {wav_file_path}.")

    def process_base64_audio(self, base64_audio, temp_filename="temp_audio.wav"):
        # Decode the base64 string
        audio_data = base64.b64decode(base64_audio)

        # Write the MP4 audio to a temporary file
        with open(temp_filename, "wb") as f:
            f.write(audio_data)

        # Convert MP4 to WAV using pydub (requires ffmpeg)
        audio = AudioSegment.from_file(temp_filename)
        audio.export(temp_filename, format="wav")

        # Process the WAV file with Whisper
        model = whisper.load_model("base")
        result = model.transcribe(temp_filename)
        print(f"Transcribed audio to text: {result['text']}")

        # Cleanup: Remove the temporary files
        os.remove(temp_filename)

        return result["text"]

    # New Method: Transcribe Audio to Text
    def transcribe_audio(self, audio_file_path):
        model = whisper.load_model("base")
        result = model.transcribe(audio_file_path)
        self._log(f"Transcribed audio to text: {result['text']}")
        self.transcription = result["text"]
        return result["text"]

    def transcribe_audio_stream(self, audio_stream):
        # Load the Whisper model
        model = whisper.load_model("base")

        # Read the audio stream into a byte array
        audio_bytes = audio_stream.read()

        # Convert the byte array to a NumPy array.
        # The audio file needs to be in a format Whisper understands (e.g., WAV).
        # If it's not in a compatible format, you might need additional steps to convert it.
        # For this example, assuming the audio is already in a compatible format (PCM 16-bit):
        audio_np = np.frombuffer(audio_bytes, dtype=np.int16)

        # Whisper expects the audio to be in float32 format, normalized between -1 and 1.
        # This conversion step is necessary if the audio was in int16 format.
        audio_np = audio_np.astype(np.float32) / 32768.0

        # Reshape the audio array to (-1, 1) if it's mono or (-1, 2) for stereo, as needed by Whisper.
        # Assuming mono audio for this example:
        audio_np = audio_np.reshape(-1, 1)

        # Transcribe the audio
        result = model.transcribe(audio_np)
        self._log(f"Transcribed audio to text: {result['text']}")
        self.transcription = result["text"]
        return result["text"]

    def calculate_levenshtein_distance(self, original_text, transcribed_text):
        return distance.edit_distance(original_text, transcribed_text)

    def keyword_analysis(self, original_text, transcribed_text):
        original_keywords = set(
            nltk.word_tokenize(original_text.lower())
        )  # Tokenize and convert to lowercase
        transcribed_keywords = set(nltk.word_tokenize(transcribed_text.lower()))
        missed_keywords = original_keywords.difference(transcribed_keywords)
        new_keywords = transcribed_keywords.difference(original_keywords)
        return list(missed_keywords), list(new_keywords)

    # New Method: Process Audio File and Predict Word Complexities
    def process_audio_and_predict(self, mp3_file_path, model_name="decision_tree"):
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not found.")
        wav_file_path = mp3_file_path.replace(".mp3", ".wav")
        self.convert_mp3_to_wav(mp3_file_path, wav_file_path)
        transcription = self.transcribe_audio(wav_file_path)
        words = transcription.split()

        complexities = {}
        for word in words:
            complexity = self.predict(word, model_name=model_name)
            if complexity is not None:
                complexities[word.lower()] = complexity

        return complexities

    def process_audio_stream_and_predict(
        self, audio_stream, model_name="decision_tree"
    ):
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not found.")
        transcription = self.transcribe_audio_stream(audio_stream)
        words = transcription.split()

        complexities = {}
        for word in words:
            complexity = self.predict(word, model_name=model_name)
            if complexity is not None:
                complexities[word.lower()] = complexity

        return complexities

    def process_text_and_predict(self, text, model_name="decision_tree"):
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not found.")
        words = text.split()
        complexities = {}
        for word in words:
            complexity = self.predict(word, model_name=model_name)
            if complexity is not None:
                complexities[word.lower()] = complexity

        return complexities

    def align_texts(self, original, transcribed):
        ops = lev.opcodes(original, transcribed)
        difficulties = []

        for op, orig_start, orig_end, trans_start, trans_end in ops:
            if op in ["replace", "delete", "insert"]:
                word_section = (
                    original[orig_start:orig_end]
                    if op != "insert"
                    else transcribed[trans_start:trans_end]
                )
                for word in word_section:
                    difficulties.append((word, op))

        return difficulties

    def normalize_text(self, text):
        """
        Normalize the input text by removing punctuation and converting to lowercase.

        Args:
        - text (str): The input text to be normalized.

        Returns:
        - str: The normalized text.
        """
        # Remove dots and commas, and convert to lowercase.
        # Extend this pattern to remove other punctuation as needed.
        text = re.sub(r"[.,]", "", text).lower()
        return text

    def calculate_readability_metrics(self, text):
        """
        Calculate various readability metrics for the given text.

        Args:
        - text (str): The input text for which to calculate readability metrics.

        Returns:
        - dict: A dictionary containing the calculated readability scores.
        """
        metrics = {
            "Automated Readability Index": textstat.automated_readability_index(text),
            "Coleman–Liau Index": textstat.coleman_liau_index(text),
            "Flesch-Kincaid Grade Level": textstat.flesch_kincaid_grade(text),
            "Flesch Reading Ease": textstat.flesch_reading_ease(text),
            "Gunning Fog Index": textstat.gunning_fog(text),
            "SMOG Grade": textstat.smog_index(text),
        }
        return metrics
