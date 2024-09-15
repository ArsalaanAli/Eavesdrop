from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from queue import Queue
import numpy as np
import threading
import re
from faster_whisper import WhisperModel
import random

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

raw_queue = Queue()
audio_queue = Queue()

text_queue = Queue()

index = 0

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('audio_data')
def handle_audio_data(data):
    raw_queue.put(data)
    
def process_raw_queue():
    global index
    print("processing")
    while True:
        raw_data = raw_queue.get()
        buffer = b''
        target_length = 50  # 1 second at 16kHz
        buffer += raw_data
        while len(buffer) >= target_length:
            # Extract exactly target_length samples
            chunk = buffer[:target_length]
            
            # Put processed audio in the queue
            audio_queue.put(chunk)
            # Remove the processed chunk from the buffer
            buffer = buffer[target_length:]
        
            # If we've processed all available data, get more
            if len(buffer) < target_length:
                raw_data = raw_queue.get()
            else:
                break  # Exit the loop if we have leftover data for next iteration
        stosend = ""
        for i in range(random.randint(5, 40)):
            stosend += chr(random.randint(48, 90))
        socketio.emit('transcript' , f"{index},{stosend} ")
        index += len(stosend) + 1
        # If there's any data left in the buffer, keep it for the next call
        if buffer:
            raw_queue.put(buffer)

@socketio.on('transcript')
def get_transcript(data):
    text_queue.put(data)

def process_text_queue():
    accumulated_text = ""
    sentence_count = 0
    
    while True:
        text = text_queue.get()
        curr_sentences = text.count('.') + text.count('!') + text.count('?')
        curr_char_count = len(text)

        if sentence_count + curr_sentences > 3 or len(accumulated_text) + curr_char_count > 400:
            # Process current accumulated text before it exceeds the limit
            if accumulated_text:
                result = check_text(accumulated_text)
                socketio.emit('highlight', result)
            
            # Reset for next batch
            accumulated_text = ""
            sentence_count = 0

        accumulated_text += text
        sentence_count += curr_sentences

# Start the text processing thread
threading.Thread(target=process_text_queue, daemon=True).start()



@app.route('/check', methods=['POST'])
def check_text():
    data = request.json
    
    return jsonify(check_text(data['text'])), 200

if __name__ == '__main__':
    # Start the audio processing thread
    threading.Thread(target=process_raw_queue, daemon=True).start()
    threading.Thread(target=process_text_queue, daemon=True).start()
    socketio.run(app, debug=True, host='127.0.0.1', port=5000)