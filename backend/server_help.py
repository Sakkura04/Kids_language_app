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
import librosa
import numpy as np
from librosa.sequence import dtw
import glob


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

def generate_feedback(syllables: list[str], segment_scores, threshold) -> list[dict]:
    feedback = []
        
    for i, score in enumerate(segment_scores):
        print(f"score {score}, threshold: {threshold}")
        if score >= threshold:
            segment_status = "correct"
            print(f"Segment {i} ({syllables[i]}): CORRECT (score: {score:.3f})")
        else:
            segment_status = "incorrect"
            print(f"Segment {i} ({syllables[i]}): INCORRECT (score: {score:.3f})")

        feedback.append({"segment": syllables[i], "status": segment_status})
        
    print("Generated feedback:", feedback)
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
        print("syllables: ", syllables)
        for syllable in syllables:
            print("syllable: ", syllable)
            f.write(syllable + "\n")


def compare_audio(user_path, tts_path, segments=None, sr=16000, n_mfcc=13, single_syllable_threshold=0.0003, multi_syllable_threshold=0.0004):
    """
    Порівнює два аудіо файли і повертає загальну схожість та схожість по сегментах.
    Аргументи:
    - user_path: шлях до аудіо користувача (WAV)
    - tts_path: шлях до еталонного аудіо (WAV)
    - sr: частота дискретизації (16 kHz), аудіо стають одномірними масивами амплітуд
    - n_mfcc: кількість MFCC коефіцієнтів (за замовчуванням 13) MFCC описує спектральну структуру звуку, наближено як людське вухо сприймає тон.
    - segments: список таймкодів для складів/фонем у форматі [(start_user, end_user, start_tts, end_tts), ...]
    - single_syllable_threshold: поріг для слів з одним складом (за замовчуванням 0.0003)
    - multi_syllable_threshold: поріг для слів з більше ніж одним складом (за замовчуванням 0.0004)

    Повертає:
    - similarity: глобальна схожість двох аудіо (0..1)
    - segment_scores: список схожостей по сегментах (якщо segments задано)
    - threshold_used: поріг, який був використаний для аналізу
    """

    user_audio, sr_user = librosa.load(user_path, sr=sr)
    tts_audio, sr_tts = librosa.load(tts_path, sr=sr)

    # Обчислюємо MFCC для глобального порівняння з адаптивним n_fft
    # Адаптуємо розмір FFT вікна до довжини сигналу
    n_fft_user_global = min(2048, max(256, len(user_audio)))
    n_fft_tts_global = min(2048, max(256, len(tts_audio)))
    
    # Переконаємося, що n_fft є степенем 2 (оптимально для FFT)
    n_fft_user_global = 2 ** int(np.log2(n_fft_user_global))
    n_fft_tts_global = 2 ** int(np.log2(n_fft_tts_global))
    
    mfcc_user = librosa.feature.mfcc(y=user_audio, sr=sr_user, n_mfcc=n_mfcc, n_fft=n_fft_user_global)
    mfcc_tts = librosa.feature.mfcc(y=tts_audio, sr=sr_tts, n_mfcc=n_mfcc, n_fft=n_fft_tts_global)

    # Переконаємося, що MFCC мають правильну розмірність для DTW
    # DTW очікує (features, time), тому транспонуємо MFCC
    if mfcc_user.ndim == 1:
        mfcc_user = mfcc_user.reshape(1, -1)
    if mfcc_tts.ndim == 1:
        mfcc_tts = mfcc_tts.reshape(1, -1)

    # DTW дозволяє порівнювати аудіо різної довжини і швидкості.
    # Транспонуємо MFCC щоб отримати (features, time) формат
    D, wp = dtw(mfcc_user, mfcc_tts, metric='euclidean')

    # Обчислюємо глобальну схожість
    distance = D[-1, -1]
    similarity = 1 / (1 + distance)

    # Визначаємо який поріг використовувати залежно від кількості сегментів
    if segments and len(segments) == 1:
        threshold_used = single_syllable_threshold
    elif segments and len(segments) > 1:
        threshold_used = multi_syllable_threshold
    else:
        threshold_used = multi_syllable_threshold  # за замовчуванням

    segment_scores = []

    # Якщо передані сегменти (таймкоди), обчислюємо локальну схожість по них
    if segments:
        for start_user, end_user, start_tts, end_tts in segments:
            # Вирізаємо сегменти
            user_seg = user_audio[int(start_user*sr_user):int(end_user*sr_user)]
            tts_seg = tts_audio[int(start_tts*sr_tts):int(end_tts*sr_tts)]

            # Перевіряємо, чи сегменти не порожні
            if len(user_seg) == 0 or len(tts_seg) == 0:
                segment_scores.append(0.0)
                continue

            # Обчислюємо MFCC для сегментів з адаптивним n_fft
            # Адаптуємо розмір FFT вікна до довжини сигналу
            n_fft_user = min(2048, max(256, len(user_seg)))
            n_fft_tts = min(2048, max(256, len(tts_seg)))
            
            # Переконаємося, що n_fft є степенем 2 (оптимально для FFT)
            n_fft_user = 2 ** int(np.log2(n_fft_user))
            n_fft_tts = 2 ** int(np.log2(n_fft_tts))
            
            mfcc_user_seg = librosa.feature.mfcc(y=user_seg, sr=sr_user, n_mfcc=n_mfcc, n_fft=n_fft_user)
            mfcc_tts_seg = librosa.feature.mfcc(y=tts_seg, sr=sr_tts, n_mfcc=n_mfcc, n_fft=n_fft_tts)

            # Переконаємося, що MFCC мають правильну розмірність для DTW
            # MFCC має бути (features, time) для DTW
            if mfcc_user_seg.ndim == 1:
                mfcc_user_seg = mfcc_user_seg.reshape(1, -1)
            if mfcc_tts_seg.ndim == 1:
                mfcc_tts_seg = mfcc_tts_seg.reshape(1, -1)

            # Перевіряємо, чи є достатньо часових кадрів для DTW
            if mfcc_user_seg.shape[1] < 2 or mfcc_tts_seg.shape[1] < 2:
                # Якщо замало кадрів, використовуємо просте порівняння
                segment_score = 0.5  # Нейтральна оцінка
            else:
                try:
                    # Виконуємо DTW на сегментах
                    D_seg, _ = dtw(mfcc_user_seg, mfcc_tts_seg, metric='euclidean')
                    segment_score = 1 / (1 + D_seg[-1, -1])
                except Exception as e:
                    print(f"DTW error for segment: {e}")
                    segment_score = 0.0

            segment_scores.append(segment_score)

    return similarity, segment_scores, threshold_used




def create_segments(user_phonemes, tts_phonemes, syllables):
    """
    Перетворює таймкоди користувача та TTS у список сегментів для функції порівняння аудіо.
    
    Аргументи:
    user_phonemes: list of tuples (start_user, end_user, 'phoneme')
    tts_phonemes: list of tuples (start_tts, end_tts, 'phoneme')
    syllables: list of складів (str)
    
    Повертає:
    segments: list of tuples (start_user, end_user, start_tts, end_tts)
    """
    segments = []

    if len(user_phonemes) != len(tts_phonemes) or len(user_phonemes) != len(syllables):
        return []
    # беремо мінімальну кількість складів серед user і TTS
    num_syllables = len(user_phonemes)

    for i in range(num_syllables):
        start_user, end_user, _ = user_phonemes[i]
        start_tts, end_tts, _ = tts_phonemes[i]

        segments.append((start_user, end_user, start_tts, end_tts))

    return segments



def cut_audio_by_timestamps(audio_path, phonemes, output_dir):
    """
    Ріже аудіо за списком фонем (у секундах) і зберігає шматки як syll1.wav, syll2.wav, ...
    
    :param audio_path: шлях до вихідного аудіофайлу (наприклад, "input.wav")
    :param phonemes: список кортежів [(start_sec, end_sec, label), ...] у секундах
    :param output_dir: шлях до папки для збереження (без назви файлу)
    """
    
    # Конвертуємо секунди в мілісекунди і відкидаємо label
    timestamps = [(int(start * 1000), int(end * 1000)) for start, end, _ in phonemes]
    
    # Створюємо папку, якщо її немає
    os.makedirs(output_dir, exist_ok=True)
    
    # Видаляємо всі старі syll*.wav
    for old_file in glob.glob(os.path.join(output_dir, "syll*.wav")):
        os.remove(old_file)
    
    # Завантажуємо аудіо
    audio = AudioSegment.from_file(audio_path)
    
    # Ріжемо і зберігаємо
    for i, (start_ms, end_ms) in enumerate(timestamps, start=1):
        chunk = audio[start_ms:end_ms]
        output_path = os.path.join(output_dir, f"syll{i}.wav")
        chunk.export(output_path, format="wav")
        print(f"Збережено: {output_path}")

