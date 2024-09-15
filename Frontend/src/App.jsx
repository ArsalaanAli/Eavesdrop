import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import "regenerator-runtime/runtime"
import { socket } from "./lib/socket"
import { ResultReason, SpeechConfig, AudioConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';

export default function Component() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [metadata, setMetadata] = useState("")
  const [displayText, setDisplayText] = useState('INITIALIZED: ready to test speech...');

  const idx = useRef(-1)

  const mediaRecorderRef = useRef(null)

  useEffect(() => {
    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      socket.connect()

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          socket.emit("audio_data", event.data)
          console.log("Audio data sent:", event.data.size, "bytes")
        }
      }

      mediaRecorderRef.current.onstop = () => {
        socket.disconnect()
      }

      socket.on("transcript", (transcript) => {
        console.log("Transcript received:", transcript)
        const delimeter = transcript.indexOf(",")
        const text = transcript.substring(delimeter + 1)
        if (idx.current === -1) {
          idx.current = parseInt(transcript.substring(0, delimeter))
        }

        setTranscript((prev) => [...prev, text])
      })

      socket.on("metadata", (metadata) => {
        console.log("Metadata received:", metadata)

        // const sample = {
        //   highlights: [
        //     {
        //       type: "text",
        //       start: 0,
        //       end: 15,
        //     },
        //   ],
        // }

        if (idx.current === -1) {
          setMetadata((prev) => [...prev, metadata])
          return
        }

        const newMetadata = metadata.map((m) => {
          return {
            ...m,
            start: m.start - idx.current,
            end: m.end - idx.current,
          }
        })

        setMetadata((prev) => [...prev, newMetadata])
      })

      mediaRecorderRef.current.start(100)
    }

    const stopRecording = () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
    }

    if (isRecording) {
      startRecording()
    } else {
      stopRecording()
    }

    return () => {
      stopRecording()
    }
  }, [isRecording])

  const toggleRecording = () => {
    setIsRecording((prev) => !prev)
  }

  async function sttFromMic() {
    const authToken = import.meta.env.VITE_SPEECH_KEY;
    const region = import.meta.env.VITE_SPEECH_REGION;
    const speechConfig = SpeechConfig.fromAuthorizationToken(authToken, region);
    speechConfig.speechRecognitionLanguage = 'en-US';
    
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    setDisplayText('speak into your microphone...');

    recognizer.recognizeOnceAsync(result => {
        if (result.reason === ResultReason.RecognizedSpeech) {
            setDisplayText(`RECOGNIZED: Text=${result.text}`);
        } else {
            setDisplayText('ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.');
        }
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-screen w-screen bg-gray-900 text-gray-100">
      {/* ... existing video and ScrollArea components ... */}
      <div className="bg-gray-800 p-4 overflow-auto">
        <div className="grid gap-4">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-100">Audio Streaming</CardTitle>
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
              <button onClick={sttFromMic}>
                Convert speech to text from your mic.
              </button>
              <p className="text-gray-300 mt-2">
                {isRecording
                  ? "Recording and streaming audio..."
                  : "Click to start recording and streaming audio."}
              </p>
              <p>{transcript}</p>
            </CardContent>
          </Card>
          {/* ... existing Card components ... */}
        </div>
      </div>
    </div>
  )
}
