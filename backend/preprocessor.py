import nltk
import numpy as np
import sqlite3

LEMMATIZER = nltk.WordNetLemmatizer()

class WordPreprocessor:

    def __init__(self, db_path="word_information.db"):
        self.db_path = db_path

    def get_feature_vector(self, word):
        """
        Returns a numpy array of features given a word.
        """
        word = word.lower()
        lemma = LEMMATIZER.lemmatize(word)
        return np.array([[
            len(lemma),
            self._get_age_of_acquisition(word),
            self._get_concreteness_score(word),
            self._get_unilem_count(lemma),
            self._get_unigram_count(word),
        ]])

    def _get_db_conn(self):
        return sqlite3.connect(self.db_path)

    def _get_age_of_acquisition(self, word):
        with self._get_db_conn() as conn:
            c = conn.cursor()
            c.execute(
                "SELECT rating_mean FROM age_of_acquisition WHERE word = ?", (word,)
            )
            result = c.fetchone()
        return float(result[0]) if result else 0

    def _get_concreteness_score(self, word):
        with self._get_db_conn() as conn:
            c = conn.cursor()
            c.execute("SELECT conc_mean FROM concreteness WHERE word = ?", (word,))
            result = c.fetchone()
        return float(result[0]) if result else 0

    def _get_unilem_count(self, lemma):
        with self._get_db_conn() as conn:
            c = conn.cursor()
            c.execute("SELECT frequency FROM unigram_count WHERE lemma = ?", (lemma,))
            result = c.fetchone()
        return float(result[0]) if result else 0

    def _get_unigram_count(self, word):
        with self._get_db_conn() as conn:
            c = conn.cursor()
            c.execute("SELECT frequency FROM unigram_count WHERE word = ?", (word,))
            result = c.fetchone()
        return float(result[0]) if result else 0
