from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from queue import Queue
from transcribe import whisper, WHISPER_LANGUAGE
import numpy as np
import threading

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

audio_queue = Queue()

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('audio_data')
def handle_audio_data(data):
    audio_queue.put(data)
    print(f"Received audio chunk. Queue size: {audio_queue.qsize()}")

def process_audio_queue():
    while True:
        if not audio_queue.empty():
            audio_chunk = audio_queue.get()
            # Process the audio chunk here
            # For now, we'll just print the size of the chunk
            # Convert audio chunk to numpy array
            audio_data_array = np.frombuffer(audio_chunk, np.int16).astype(np.float32) / 255.0

            # Transcribe the audio
            segments, _ = whisper.transcribe(audio_data_array,
                                             language=WHISPER_LANGUAGE,
                                             beam_size=5,
                                             vad_filter=True,
                                             vad_parameters=dict(min_silence_duration_ms=1000))
            
            # Join the transcribed segments
            transcription = " ".join([s.text for s in segments])
            
            print(f"Transcription: {transcription}")
            print(f"Processing audio chunk of size: {len(audio_chunk)}")
        socketio.sleep(0.1)  # Small delay to prevent busy-waiting

@app.route('/check', methods=['POST'])
def check_text():
    data = request.json
    
    return jsonify(check_text(data['text'])), 200

if __name__ == '__main__':
    # Start the audio processing thread
    threading.Thread(target=process_audio_queue, daemon=True).start()
    socketio.run(app, debug=True, host='127.0.0.1', port=5000)