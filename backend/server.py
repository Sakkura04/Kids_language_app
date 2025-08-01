from flask import Flask, request, jsonify
from flask_cors import CORS
from predictor import WordComplexityPredictor
from db.help import add_result_text_record,find_text_record_by_read_part, update_text_record_by_read_part, check_word_mastery, get_words_vocabulary, get_mistakes_with_words, increase_recognition
from server_help import extract_missing_keywords_from_result, remove_digits_and_specials
from db.gpt_api import generate_word_info
from db.help import fill_existing_words, word_exists_in_existing_words, add_mistake, get_fragment_by_id, get_first_fragment_id, get_last_fragment_id, get_random_meanings_except
import sqlite3

app = Flask(__name__)
CORS(app)

BEST_MODEL_NAME = "random_forest"
predictor = WordComplexityPredictor(debug=True)
selected_book_id = 1  # Default book ID


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
                fill_existing_words(word)
            if check_word_mastery(word_id) is False:  
                continue
            
            add_mistake(word, word_id)

    # Check if this text-part was already read
    existing_id = find_text_record_by_read_part(displayed_text)
    if existing_id is not None:
        update_text_record_by_read_part(displayed_text, response_data)
    else:
        add_result_text_record(displayed_text, response_data)
    return jsonify(response_data)



def process_audio_and_text(audio_base64, original_text, model_name):
    # Assuming your transcription method can handle a stream
    transcription = predictor.process_base64_audio(audio_base64)

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

#-----------------PRONOUNCE SCREEN------------------
@app.route("/get-pronunciation-words", methods=["GET"])
def get_mispronounced_words():
    words = get_mistakes_with_words()
    print("words:", words) 
    return jsonify({"words": words})

@app.route("/analyze-pronunciation", methods=["POST"])
def analyze_pronunciation():
    try:
        data = request.get_json()
        audio_base64 = data.get("audio")
        word = data.get("word")
        
        if not audio_base64 or not word:
            return jsonify({"error": "Missing audio or word data"}), 400
        
        print(f"Analyzing pronunciation for word: {word}")
        
        # TODO: Implement actual pronunciation analysis
        # For now, return mock data structure
        mock_feedback = [
            {"segment": "ap", "status": "correct"},
            {"segment": "ple", "status": "incorrect"}
        ]
        
        response_data = {
            "transcription": f"User said: {word}",
            "feedback": mock_feedback,
            "feedback_sentence": "Nice try! You had a few small mistakes.",
            "correct_audio": "base64_audio_placeholder",  # TODO: Add actual correct pronunciation audio
            "segment_audios": {
                "ap": "base64_audio_placeholder",
                "ple": "base64_audio_placeholder"
            }
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error in analyze_pronunciation: {str(e)}")
        return jsonify({"error": "Failed to analyze pronunciation"}), 500

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