from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from queue import Queue
import numpy as np
import threading
import re
from dotenv import load_dotenv
import os
import time
import azure.cognitiveservices.speech as speechsdk

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

raw_queue = Queue()
audio_queue = Queue()

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
    print("processing")
    while True:
        raw_data = raw_queue.get()
        buffer = b''
        target_length = 100  # 1 second at 16kHz
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
        
        # If there's any data left in the buffer, keep it for the next call
        if buffer:
            raw_queue.put(buffer)


def consumer_thread():
    """Consumer thread that processes audio bytes from the queue and transcribes them in real-time."""
    load_dotenv()
    speech_config = speechsdk.SpeechConfig(subscription=os.getenv("SPEECH_KEY"), region=os.getenv("SPEECH_REGION"))

    # Setup the audio stream
    stream = speechsdk.audio.PushAudioInputStream()
    audio_config = speechsdk.audio.AudioConfig(stream=stream)

    # Instantiate the speech recognizer with push stream input
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

    # def recognizing_cb(evt: speechsdk.SpeechRecognitionEventArgs):
    #     print(evt.result.text)

    def recognized_cb(evt: speechsdk.SpeechRecognitionEventArgs):
        print(evt.result.text)

    def stop_cb(evt: speechsdk.SessionEventArgs):
        """callback that signals to stop continuous recognition"""
        print('CLOSING on {}'.format(evt))

    # Connect callbacks to the events fired by the speech recognizer
    # speech_recognizer.recognizing.connect(recognizing_cb)
    speech_recognizer.recognized.connect(recognized_cb)
    speech_recognizer.session_started.connect(lambda evt: print('SessionStarted event'))
    speech_recognizer.session_stopped.connect(stop_cb)
    speech_recognizer.canceled.connect(stop_cb)

    # Start continuous speech recognition -- turning off for now
    # speech_recognizer.start_continuous_recognition() 

    # Push audio data from the queue to the PushAudioInputStream
    push_stream_writer(stream)

    # Stop recognition (this should be called when you want to stop recognition)
    speech_recognizer.stop_continuous_recognition()


def push_stream_writer(stream):
    """Push audio data from the queue to the stream."""
    try:
        while True:
            if not raw_queue.empty():
                audio_chunk = raw_queue.get()
                print('read {} bytes'.format(len(audio_chunk)))
                if not audio_chunk:
                    break
                stream.write(audio_chunk)
                raw_queue.task_done()
            else:
                time.sleep(0.1)  # Adjust sleep time as needed
    finally:
        stream.close()  # must be done to signal the end of stream

def speech_recognition_with_push_stream():
    """gives an example how to use a push audio stream to recognize speech from a custom audio
    source"""
    load_dotenv()
    speech_config = speechsdk.SpeechConfig(subscription=os.getenv("SPEECH_KEY"), region=os.getenv("SPEECH_REGION"))

    # Setup the audio stream
    stream = speechsdk.audio.PushAudioInputStream()
    audio_config = speechsdk.audio.AudioConfig(stream=stream)

    # Instantiate the speech recognizer with push stream input
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    recognition_done = threading.Event()

    # Connect callbacks to the events fired by the speech recognizer
    def session_stopped_cb(evt):
        """callback that signals to stop continuous recognition upon receiving an event `evt`"""
        print('SESSION STOPPED: {}'.format(evt))
        recognition_done.set()

    speech_recognizer.recognizing.connect(lambda evt: print('RECOGNIZING: {}'.format(evt)))
    speech_recognizer.recognized.connect(lambda evt: print('RECOGNIZED: {}'.format(evt)))
    speech_recognizer.session_started.connect(lambda evt: print('SESSION STARTED: {}'.format(evt)))
    speech_recognizer.session_stopped.connect(session_stopped_cb)
    speech_recognizer.canceled.connect(lambda evt: print('CANCELED {}'.format(evt)))

    # Start push stream writer thread
    push_stream_writer_thread = threading.Thread(target=push_stream_writer, args=[stream])
    push_stream_writer_thread.start()

    # Start continuous speech recognition
    speech_recognizer.start_continuous_recognition()

    # Wait until all input processed
    recognition_done.wait()

    # Stop recognition and clean up
    speech_recognizer.stop_continuous_recognition()
    push_stream_writer_thread.join()


@app.route('/check', methods=['POST'])
def check_text():
    data = request.json
    
    return jsonify(check_text(data['text'])), 200

if __name__ == '__main__':
    # Start the audio processing thread
    threading.Thread(target=process_raw_queue, daemon=True).start()
    threading.Thread(target=consumer_thread, daemon=True).start()
    # threading.thread(target=send_chunk, args=(audio_queue,), daemon=True).start()
    socketio.run(app, debug=True, host='127.0.0.1', port=5000)