from flask import Flask, request, jsonify
from flask_cors import CORS
from db.help import get_word_transcription, add_result_text_record,find_text_record_by_read_part, update_text_record_by_read_part, syllables_from_existing_words, check_word_mastery, get_words_vocabulary, get_mistakes_with_words, increase_recognition
from server_help import cut_audio_by_timestamps, create_segments, compare_audio, extract_missing_keywords_from_result, save_syllables_to_txt, tts_to_base64, generate_feedback, split_on_hyphen, remove_digits_and_specials, clean_and_convert_numbers, process_audio_and_text
from db.gpt_api import split_transcription_into_phonemes
from db.help import fill_existing_words, word_exists_in_existing_words, add_mistake, get_fragment_by_id, get_first_fragment_id, get_last_fragment_id, get_random_meanings_except
import sqlite3
from gtts import gTTS
import os
import base64
from server_help import save_base64_wav, run_mfa, get_phoneme_timings, extract_missing_keywords_from_result, tts_to_base64, generate_feedback, split_on_hyphen, remove_digits_and_specials, clean_and_convert_numbers, process_audio_and_text

app = Flask(__name__)
CORS(app)
selected_book_id = 1  # Default book ID
BEST_MODEL_NAME = "random_forest"

@app.route("/home", methods=["GET"])
def home():
    return jsonify({
        "message": "Welcome to the Language Learning App!",
        "info": "This is the home endpoint. Customize this data as needed for your HomeScreen."
    })

#-----------------RECORDING SCREEN-------------------
@app.route("/get-reading-text", methods=["POST"])
def get_reading_text():
    data = request.get_json()
    fragment_id = get_first_fragment_id(selected_book_id) + data.get("fragment_id", 0) - 1 # Calculate fragment_id as selected_book_id + provided fragment_id

    if fragment_id == None:
        return jsonify({"error": "fragment_id is required"}), 400
    fragment = get_fragment_by_id(fragment_id)
    if fragment == None:
        return jsonify({"error": "fragment_id is required"}), 400

    return jsonify({
        "fragment_id": fragment["fragment_id"],
        "chapter_name": fragment["chapter_name"],
        "text": fragment["text"],
        "book_id": fragment["book_id"]
    })

@app.route("/get-min-max-fragment-id", methods=["POST"])
def get_min_max_fragment_id():
    data = request.get_json()
    max_fragment_id = get_last_fragment_id(book_id=selected_book_id)
    return jsonify({
        "max_fragment_id": max_fragment_id,
        "min_fragment_id": get_first_fragment_id(selected_book_id),
    })

@app.route("/process-recorded-text", methods=["POST"])
def process_recording():
    print("POST /process-recorded-text called")
    data = request.get_json()
    audio_base64 = data["audio"]
    displayed_text = data["displayed_text"]

    # Process the audio data and displayed text
    response_data = process_audio_and_text(audio_base64, displayed_text, BEST_MODEL_NAME)
    print("Response data:", response_data)  # Log the results

    # Extract missing keywords and fill book db if any
    missed_keywords, _ = extract_missing_keywords_from_result(response_data)
    missed_keywords = remove_digits_and_specials(missed_keywords)
    print("Missed words:", missed_keywords)  # Log the results
    if missed_keywords:
        for word in missed_keywords:
            print(f"Word: {word}")
            word_id = word_exists_in_existing_words(word)
            if word_id == -1:
                word_id = fill_existing_words(word)
            elif check_word_mastery(word_id) is True:
                    continue
                
            add_mistake(word, word_id)

    # Check if this text-part was already read
    existing_id = find_text_record_by_read_part(displayed_text)
    if existing_id is not None:
        update_text_record_by_read_part(displayed_text, response_data)
    else:
        add_result_text_record(displayed_text, response_data)
    return jsonify(response_data)





#-----------------PRONOUNCE SCREEN------------------
@app.route("/get-pronunciation-words", methods=["GET"])
def get_mispronounced_words():
    words = get_mistakes_with_words()
    return jsonify({"words": words})

@app.route("/analyze-pronunciation", methods=["POST"])
def analyze_pronunciation():
    try:
        data = request.get_json()
        audio_base64 = data.get("audio")
        word = clean_and_convert_numbers(data.get("word"))
        # syllables = split_on_hyphen(syllables_from_existing_words(word))
        syllables = split_transcription_into_phonemes( get_word_transcription(word).replace("/", "").replace("\\", ""))


        if not audio_base64 or not word:
            return jsonify({"error": "Missing audio or word data"}), 400
        
        # Перевірка даних
        if not audio_base64 or not isinstance(audio_base64, str):
            return jsonify({"error": "Invalid audio data"}), 400
        if not word or not isinstance(word, str):
            return jsonify({"error": "Invalid word"}), 400

        print("Word:", word)
        print("transcript:", get_word_transcription(word).replace("/", "").replace("\\", ""))
        print("phonemas:", syllables)
        print("\n\n")

        # Step 1: Save user audio/text to temp file
        #user_id = str(uuid.uuid4())
        user_id = 1
        user_audio_path = f"temp/audio_user_{user_id}.wav"
        user_lab_path = user_audio_path.replace(".wav", ".lab")
        save_base64_wav(audio_base64, user_audio_path)
        save_syllables_to_txt(syllables, user_lab_path)

        # Step 2: Generate correct TTS audio
        tts_base64 = tts_to_base64(word)
        tts_audio_path = f"temp/audio_tts_{user_id}.wav"
        tts_lab_path = tts_audio_path.replace(".wav", ".lab")
        save_syllables_to_txt(syllables, tts_lab_path)

        #декодує base64 в wav
        save_base64_wav(tts_base64, tts_audio_path)

        output_dir_user = f"temp/output_user_{user_id}"
        output_dir_tts = f"temp/output_tts_{user_id}"
        os.makedirs(output_dir_user, exist_ok=True)
        os.makedirs(output_dir_tts, exist_ok=True)

        # Step 3: Run MFA alignment
        run_mfa(user_audio_path, user_lab_path, output_dir_user)
        run_mfa(tts_audio_path, tts_lab_path, output_dir_tts)

        # Step 4: Extract phoneme timings (form path to mfa timing files)
        print("output_dir_user:", output_dir_user)
        print("os.path.basename(user_audio_path):", os.path.basename(user_audio_path))
        print("output_dir_tts:", output_dir_tts)
        print("os.path.basename(tts_audio_path):", os.path.basename(tts_audio_path))
        user_phonemes = get_phoneme_timings(os.path.join(output_dir_user, os.path.basename(user_audio_path).replace(".wav", ".TextGrid")))
        print("user_phonemes:", user_phonemes)
        tts_phonemes = get_phoneme_timings(os.path.join(output_dir_tts, os.path.basename(tts_audio_path).replace(".wav", ".TextGrid")))
        print("tts_phonemes:", tts_phonemes)

        segments = create_segments(user_phonemes, tts_phonemes, syllables)
        print("segments:", segments)
        similarity, segment_scores, threshold_used = compare_audio(user_audio_path, tts_audio_path, segments=segments, sr=16000, n_mfcc=13)
        # Приклад використання
        cut_audio_by_timestamps(tts_audio_path, tts_phonemes, "temp/correct_syllables")


        # textgrid_user="temp/output_user_1/audio_user_1.TextGrid",
        # textgrid_tts="temp/output_tts_1/audio_tts_1.TextGrid"
        # similarity, segment_scores = compare_audio(user_audio_path, tts_audio_path, segments=segments, sr=16000, n_mfcc=13, textgrid_user=textgrid_user, textgrid_tts=textgrid_tts )
        
        print("similarity:", similarity)
        print("segment_scores:", segment_scores)
        
        # Визначаємо статус кожного складу на основі оцінки схожості
        feedback = generate_feedback(syllables, segment_scores, threshold_used)
        print("feedback:", feedback)
        print("threshold used:", threshold_used)

        audio_base64 = data.get("audio")
        # Step 6: Build response
        
        # Генеруємо динамічне feedback_sentence на основі результатів
        correct_count = sum(1 for _, status in feedback if status == "correct")
        total_segments = len(feedback)
        
        if correct_count == total_segments:
            feedback_sentence = "Excellent pronunciation! All syllables are correct."
        elif correct_count >= total_segments * 0.5:  # 70% або більше правильних
            feedback_sentence = "Great job! Most syllables are pronounced correctly."
        elif correct_count >= total_segments * 0.2:  # 40% або більше правильних
            feedback_sentence = "Good effort! Some syllables need improvement."
        else:
            feedback_sentence = "Keep practicing! Focus on pronunciation of each syllable."
        
        print (f"feedback_sentence: {feedback_sentence}")

        response_data = {
            "transcription": f"User said: {word}",
            "feedback": feedback,
            "feedback_sentence": "feedback_sentence",
            "correct_audio": "tts_base64",  # TODO: Add actual correct pronunciation audio
            "segment_audios": {
                "ap": "base64_audio_placeholder",
                "ple": "base64_audio_placeholder"
            },
            "pronunciation_analysis": {
                "overall_similarity": round(similarity, 4),
                "threshold_used": round(threshold_used, 6),
                "correct_segments": correct_count,
                "total_segments": total_segments,
                "accuracy_percentage": round((correct_count / total_segments) * 100, 1)
            }
        }
        return jsonify(response_data)

    except Exception as e:
        print(f"Error in analyze_pronunciation: {str(e)}")
        return jsonify({"error": "Failed to analyze pronunciation"}), 500

@app.route("/get-correct-syllable-audio/<int:syllable_number>", methods=["GET"])
def get_correct_syllable_audio(syllable_number):
    try:
        # Construct the path to the correct syllable audio file
        audio_file_path = f"temp/correct_syllables/syll{syllable_number}.wav"
        
        # Check if the file exists
        if not os.path.exists(audio_file_path):
            return jsonify({"error": f"Audio file syll{syllable_number}.wav not found"}), 404
        
        # Read the audio file and convert to base64
        with open(audio_file_path, "rb") as audio_file:
            audio_data = audio_file.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return jsonify({"audio": audio_base64})
        
    except Exception as e:
        print(f"Error in get_correct_syllable_audio: {str(e)}")
        return jsonify({"error": "Failed to get syllable audio"}), 500

#-----------------VOCABULARY SCREEN------------------
@app.route("/get-vocabulary-words", methods=["GET"])
def get_misinterpreted_words():
    words = get_words_vocabulary()
    return jsonify({"words": words})

@app.route("/increase-recognition", methods=["POST"])
def increase_word_recognition():
    try:
        data = request.get_json()
        word_id = data.get("word_id")
        
        if word_id is None:
            return jsonify({"error": "word_id is required"}), 400
        
        increase_recognition(word_id)
        return jsonify({"message": "Recognition increased successfully"})
        
    except Exception as e:
        print(f"Error in increase_word_recognition: {str(e)}")
        return jsonify({"error": "Failed to increase recognition"}), 500
    
#-------------------BOOK SCREEN-------------------
@app.route("/select-book", methods=["POST"])
def select_book():
    global selected_book_id
    data = request.get_json()
    book_id = data.get("book_id", 1)
    selected_book_id = book_id
    return jsonify({"message": f"Book {book_id} selected successfully", "book_id": book_id})


@app.route("/get-books", methods=["GET"])
def get_books():
    DB_PATH = "db/book.db"
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM books")
    books = cur.fetchall()
    conn.close()
    # Return as a list of dicts
    books_list = [{"book_id": row[0], "name": row[1]} for row in books]
    return jsonify({"books": books_list})


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)