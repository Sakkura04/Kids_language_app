import sqlite3
import string
import os
from num2words import num2words
from predictor import WordComplexityPredictor
from gtts import gTTS
import base64
from io import BytesIO
from praatio import textgrid
import re
import subprocess
from subprocess import CalledProcessError
from pydub import AudioSegment


predictor = WordComplexityPredictor(debug=True)


def process_audio_and_text(audio_base64, original_text, model_name):
    # Assuming your transcription method can handle a stream
    transcription = clean_and_convert_numbers(predictor.process_base64_audio(audio_base64))

    # Levenshtein Distance
    lev_distance = predictor.calculate_levenshtein_distance(
        original_text, transcription
    )

    # Keyword Analysis
    missed_keywords, new_keywords = predictor.keyword_analysis(
        original_text, transcription
    )

    word_complexities = predictor.process_text_and_predict(
        original_text, model_name=model_name
    )
    sentences = original_text.split(". ")
    readability_metrics = {
        sentence: predictor.calculate_readability_metrics(sentence)
        for sentence in sentences
        if sentence
    }

    response = {
        "transcription": transcription,
        "levenshtein_distance": lev_distance,
        "missed_keywords": missed_keywords,
        "new_keywords": new_keywords,
        "word_complexities": word_complexities,
        "readability_metrics": readability_metrics,
    }
    return response


def extract_missing_keywords_from_result(result):
    """
    Given a result dictionary (as returned by process_audio_and_text),
    extract the 'missed_keywords' and 'new_keywords' fields and return them as arrays.
    If the fields are not present or not lists, return empty lists for them.
    """
    missed = result.get('missed_keywords', [])
    new = result.get('new_keywords', [])
    # Ensure both are lists (in case they are not)
    if not isinstance(missed, list):
        missed = list(missed) if isinstance(missed, (set, tuple)) else [missed]
    if not isinstance(new, list):
        new = list(new) if isinstance(new, (set, tuple)) else [new]
    return missed, new


def remove_digits_and_specials(arr):
    allowed_chars = set(string.ascii_letters)  #only english letters
    cleaned = []
    
    for item in arr:
        if len(item) <= 1:
            continue
        if all(char in allowed_chars for char in item):
            cleaned.append(item)
    
    return cleaned

def clean_and_convert_numbers(text: str) -> str:
    # 1. Прибираємо спеціальні символи, залишаємо літери, цифри, пробіли
    cleaned = re.sub(r'[^A-Za-z0-9\s]', '', text)
    
    # 2. Знаходимо числа в тексті
    def replace_number(match):
        num_str = match.group(0)
        # Перетворюємо число в слова англійською
        try:
            num_word = num2words(int(num_str))
            return num_word.replace('-', ' ')  # замінюємо дефіси на пробіли
        except:
            return num_str  # якщо не вдається конвертувати, повертаємо як є

    # Заміна чисел на слова
    converted = re.sub(r'\d+', replace_number, cleaned)

    # 3. Прибираємо зайві пробіли
    converted = re.sub(r'\s+', ' ', converted).strip()
    
    return converted


def split_on_hyphen(s: str) -> list:
    parts = s.split('-')
    return parts

def generate_feedback(segments: list[str], incorrect_indices: list[int]) -> list[dict]:
    feedback = []
    for i, segment in enumerate(segments):
        status = "incorrect" if i in incorrect_indices else "correct"
        feedback.append({"segment": segment, "status": status})
    return feedback


#встановлює точний час початку і кінця кожної фонеми в записі
def tts_to_base64(text, lang='en'):
    # Generate speech
    tts = gTTS(text, lang=lang)
    tts.save(f'{text}.wav')

    # Save to memory buffer
    buffer = BytesIO()
    tts.write_to_fp(buffer)
    buffer.seek(0)  # Go to start of buffer

    # Encode to base64
    audio_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    return audio_base64


#розшифровує згенерований MFA для кожного аудіо файл .TextGrid, в якому містяться фонеми з точними таймінгами їх вимови.
def get_phoneme_timings(textgrid_path: str):
    tg = textgrid.openTextgrid(textgrid_path, includeEmptyIntervals=False)
    phoneme_tier = tg.getTier("phones")  # витягуємо tier за назвою
    return [(start, end, label) for start, end, label in phoneme_tier.entries]


#встановлює точний час початку і кінця кожної фонеми в записі
def run_mfa(audio_path: str, lab_path: str, output_dir: str):
    command = [
        "mfa", "align",
        os.path.dirname(audio_path),
        "english_us_arpa",
        "english_mfa",
        output_dir,
        "--clean",
        "--overwrite"
    ]
    print("Running MFA with command:", " ".join(command))
    subprocess.run(command, check=True)


def save_base64_wav(base64_str: str, file_path: str):
    try:
        audio_data = base64.b64decode(base64_str)
        # Спробуємо автоматично визначити формат
        audio = AudioSegment.from_file(BytesIO(audio_data))
        audio.export(file_path, format="wav")
    except Exception as e:
        print(f"Error saving audio: {str(e)}")
        raise


def save_syllables_to_txt(syllables, filename):
    with open(filename, "w", encoding="utf-8") as f:
        for syllable in syllables:
            f.write(syllable + "\n")
