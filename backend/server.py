from flask import Flask, request, jsonify
from flask_cors import CORS
from predictor import WordComplexityPredictor


app = Flask(__name__)
CORS(app)

BEST_MODEL_NAME = "random_forest"
predictor = WordComplexityPredictor(debug=True)


@app.route("/process-audio-text", methods=["POST"])
def process_audio_text():
    data = request.get_json()
    audio_base64 = data["audio"]
    original_text = data["original_text"]

    # Process the audio data and original text
    response_data = process_audio_and_text(audio_base64, original_text, BEST_MODEL_NAME)
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


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
