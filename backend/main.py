from predictor import WordComplexityPredictor

# Initialize the predictor.
predictor = WordComplexityPredictor(debug=True)

# Path to your MP3 file.
mp3_file_path = "audio\output_000.wav"
original_text = (
    "once last year i found an armor and dog. i found a dog and played with him"
)

# Open a file to write the outputs
with open("output.txt", "w") as output_file:
    # Iterate over each model in the predictor
    for model_name in predictor.models.keys():
        output_file.write(f"\nResults using model: {model_name}\n")
        print(f"\nResults using model: {model_name}\n")

        # Process the audio file and get word complexities.
        word_complexities = predictor.process_audio_and_predict(
            mp3_file_path, model_name=model_name
        )

        output_file.write("Word complexities:\n")
        output_file.write(f"{word_complexities}\n")
        print("Word complexities:", word_complexities)

        # Analyzing each sentence
        sentences = original_text.split(". ")
        for sentence in sentences:
            if sentence:  # Ensure the sentence is not empty
                # Calculate readability metrics for the sentence
                readability_metrics = predictor.calculate_readability_metrics(sentence)
                output_file.write(f"Readability metrics for sentence: '{sentence}'\n")
                print(f"Readability metrics for sentence: '{sentence}'")
                for metric, value in readability_metrics.items():
                    output_file.write(f"  {metric}: {value}\n")
                    print(f"  {metric}: {value}")

                # Calculate word complexities for the sentence
                word_complexities = predictor.process_text_and_predict(
                    sentence, model_name=model_name
                )
                output_file.write("  Word complexities:\n")
                print("  Word complexities:")
                for word, complexity in word_complexities.items():
                    output_file.write(f"    {word}: {complexity}\n")
                    print(f"    {word}: {complexity}")

# Normalize the original and transcribed texts before splitting and aligning
normalized_original_text = predictor.normalize_text(original_text)
normalized_transcription = predictor.normalize_text(predictor.transcription)

print("\nNormalized original text:", normalized_original_text)
print("\nNormalized transcribed text:", normalized_transcription)

# Now proceed with the alignment using the normalized texts
difficulties = predictor.align_texts(
    normalized_original_text.split(), normalized_transcription.split()
)
# print("\nPotential difficulties and their complexities:", difficulties)

print("\nPotential difficulties and their complexities:")
for word, operation in difficulties:
    if word in word_complexities:
        print(
            f"Word: '{word}', Operation: {operation}, Complexity: {word_complexities[word]}"
        )
    else:
        # If the word is not in word_complexities, it might be a common word or not evaluated.
        print(f"Word: '{word}', Operation: {operation}, Complexity: Not Evaluated")
