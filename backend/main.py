from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from queue import Queue
import numpy as np
import threading
import re
from faster_whisper import WhisperModel

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

audio_queue = Queue()

# Audio settings
STEP_IN_SEC: int = 1    # We'll increase the processable audio data by this
LENGHT_IN_SEC: int = 6    # We'll process this amount of audio data together maximum
NB_CHANNELS = 1
RATE = 16000
CHUNK = RATE

# Whisper settings
WHISPER_LANGUAGE = "en"
WHISPER_THREADS = 4

# Visualization (expected max number of characters for LENGHT_IN_SEC audio)
MAX_SENTENCE_CHARACTERS = 80

# This queue holds all the chunks that will be processed together
# If the chunk is filled to the max, it will be emptied
length_queue = Queue(maxsize=LENGHT_IN_SEC)

# Whisper model
whisper = WhisperModel("tiny", device="cpu", compute_type="int8", cpu_threads=WHISPER_THREADS, download_root="./models")


@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('audio_data')
def handle_audio_data(data):
    audio_queue.put(data)
    
def process_audio_queue():
    while True:
        if length_queue.qsize() >= LENGHT_IN_SEC:
            with length_queue.mutex:
                length_queue.queue.clear()
                print()

        audio_data = audio_queue.get()
        length_queue.put(audio_data)

        # Concatenate audio data in the lenght_queue
        audio_data_to_process = b""
        for i in range(length_queue.qsize()):
            # We index it so it won't get removed
            audio_data_to_process += length_queue.queue[i]

        # convert the bytes data toa  numpy array
        audio_data_array: np.ndarray = np.frombuffer(audio_data_to_process, np.int16).astype(np.float32) / 255.0
        # audio_data_array = np.expand_dims(audio_data_array, axis=0)

        segments, _ = whisper.transcribe(audio_data_array,
                                         language=WHISPER_LANGUAGE,
                                         beam_size=5,
                                         vad_filter=True,
                                         vad_parameters=dict(min_silence_duration_ms=1000))
        segments = [s.text for s in segments]

        transcription = " ".join(segments)
        # remove anything from the text which is between () or [] --> these are non-verbal background noises/music/etc.
        transcription = re.sub(r"\[.*\]", "", transcription)
        transcription = re.sub(r"\(.*\)", "", transcription)
        # We do this for the more clean visualization (when the next transcription we print would be shorter then the one we printed)
        transcription = transcription.ljust(MAX_SENTENCE_CHARACTERS, " ")

        print(transcription, end='\r', flush=True)

        audio_queue.task_done()

@app.route('/check', methods=['POST'])
def check_text():
    data = request.json
    
    return jsonify(check_text(data['text'])), 200

if __name__ == '__main__':
    # Start the audio processing thread
    threading.Thread(target=process_audio_queue, daemon=True).start()
    socketio.run(app, debug=True, host='127.0.0.1', port=5000)