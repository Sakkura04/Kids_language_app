from pydub import AudioSegment
import whisper
import librosa
import parselmouth
import numpy as np


# Step 1: Convert MP3 to WAV
def convert_mp3_to_wav(mp3_file_path, wav_file_path):
    audio = AudioSegment.from_mp3(mp3_file_path)
    audio.export(wav_file_path, format="wav")


# Step 2: Transcribe Audio to Text with Whisper
def transcribe_audio(audio_file_path):
    model = whisper.load_model("base")
    result = model.transcribe(audio_file_path)
    return result["text"]


def analyze_audio_prosodic_features(audio_file_path):
    # Load the audio file
    y, sr = librosa.load(audio_file_path)

    # Use Parselmouth to analyze pitch and intensity
    snd = parselmouth.Sound(audio_file_path)
    pitch = snd.to_pitch()
    intensity = snd.to_intensity()

    # Extract pitch values and intensity values
    pitch_values = pitch.selected_array["frequency"]
    intensity_values = intensity.values.T[0]

    # Filter out unvoiced (0 Hz) pitch values for mean pitch calculation
    voiced_pitch_values = pitch_values[pitch_values != 0]
    mean_pitch = np.mean(voiced_pitch_values) if len(voiced_pitch_values) > 0 else 0
    mean_intensity = np.mean(intensity_values)

    # Calculate the duration of the audio in seconds
    duration = librosa.get_duration(y=y, sr=sr)

    # Calculate the speech rate (number of voiced frames per second)
    speech_rate = len(voiced_pitch_values) / duration

    print(
        {
            "mean_pitch": mean_pitch,
            "mean_intensity": mean_intensity,
            "duration": duration,
            "speech_rate": speech_rate,
        }
    )

    return {
        "mean_pitch": mean_pitch,
        "mean_intensity": mean_intensity,
        "duration": duration,
        "speech_rate": speech_rate,
    }


# Putting It All Together
def main(wav_file_path, original_text):

    # Transcribe the audio to text
    transcribed_text = transcribe_audio(wav_file_path)
    print("Transcribed Text:", transcribed_text)


# Example Usage
if __name__ == "__main__":
    mp3_file_path = "audio\output_003.wav"
    original_text = "once last year i found an armour and a dog"
    main(mp3_file_path, original_text)
