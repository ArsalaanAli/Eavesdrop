import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeechConfig, AudioConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';

// Replace these with your actual values
const SPEECH_KEY = import.meta.env.VITE_SPEECH_KEY;
const SPEECH_REGION = import.meta.env.VITE_SPEECH_REGION;

export default function Component() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognizerRef = useRef(null);

  const startRecognition = async () => {
    const speechConfig = SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
    speechConfig.speechRecognitionLanguage = 'en-US';
    
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    recognizerRef.current = new SpeechRecognizer(speechConfig, audioConfig);

    recognizerRef.current.recognizing = (s, e) => {
      console.log(`RECOGNIZING: Text=${e.result.text}`);
      setTranscript(e.result.text);
    };

    recognizerRef.current.recognized = (s, e) => {
      if (e.result.reason == ResultReason.RecognizedSpeech) {
        console.log(`RECOGNIZED: Text=${e.result.text}`);
        setTranscript(prevTranscript => prevTranscript + " " + e.result.text);
      }
      else if (e.result.reason == ResultReason.NoMatch) {
        console.log("NOMATCH: Speech could not be recognized.");
      }
    };

    recognizerRef.current.canceled = (s, e) => {
      console.log(`CANCELED: Reason=${e.reason}`);
      if (e.reason == CancellationReason.Error) {
        console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
        console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
        console.log("CANCELED: Did you update the subscription info?");
      }
      recognizerRef.current.stopContinuousRecognitionAsync();
    };

    recognizerRef.current.sessionStopped = (s, e) => {
      console.log("\n    Session stopped event.");
      recognizerRef.current.stopContinuousRecognitionAsync();
    };

    recognizerRef.current.startContinuousRecognitionAsync();
    setIsRecording(true);
  };

  const stopRecognition = async () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stopContinuousRecognitionAsync();
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-screen w-screen bg-gray-900 text-gray-100">
      <div className="bg-gray-800 p-4 overflow-auto">
        <div className="grid gap-4">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-100">Speech-to-Text</CardTitle>
            </CardHeader>
            <CardContent>
              <button
                onClick={toggleRecording}
                className={`px-4 py-2 rounded ${
                  isRecording ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
              <p className="text-gray-300 mt-2">
                {isRecording
                  ? "Recording... Speak into your microphone."
                  : "Click to start recording and converting speech to text."}
              </p>
              <p className="mt-4 text-gray-100">{transcript}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}