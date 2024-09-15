import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AudioConfig,
  ResultReason,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk"
import { useEffect, useRef, useState } from "react"
import "regenerator-runtime/runtime"
import { Button } from "./components/ui/button"
import { ScrollArea } from "./components/ui/scroll-area"
import { GetHighlightedTranscript } from "./lib/helpers"

export default function App() {
  const SPEECH_KEY = import.meta.env.VITE_SPEECH_KEY
  const SPEECH_REGION = import.meta.env.VITE_SPEECH_REGION

  const [highlights, setHighlights] = useState([
    { start: 5, end: 15, type: "false" },
  ])

  const [highlightedTranscript, setHighlightedTranscript] = useState([])

  var curIteration = useRef(0)

  useEffect(() => {
    curIteration.current += 1
    console.log(curIteration.current)
    console.log(highlights)
    setHighlightedTranscript(
      GetHighlightedTranscript(transcript, highlights, curIteration),
    )
  }, [highlights, transcript])

  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [intermediateTranscript, setIntermediateTranscript] = useState("")
  const recognizerRef = useRef(null)

  const startRecognition = async () => {
    const speechConfig = SpeechConfig.fromSubscription(
      SPEECH_KEY,
      SPEECH_REGION,
    )
    speechConfig.speechRecognitionLanguage = "en-US"

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput()
    recognizerRef.current = new SpeechRecognizer(speechConfig, audioConfig)

    recognizerRef.current.recognizing = (s, e) => {
      setIntermediateTranscript(e.result.text)
    }

    recognizerRef.current.recognized = (s, e) => {
      if (e.result.reason == ResultReason.RecognizedSpeech) {
        setTranscript((prevTranscript) => {
          const mostRecentSentence = e.result.text
          const newTranscript =
            prevTranscript + (prevTranscript ? " " : "") + mostRecentSentence
          setIntermediateTranscript("")
          return newTranscript
        })
      } else if (e.result.reason == ResultReason.NoMatch) {
        console.log("NOMATCH: Speech could not be recognized.")
      }
    }

    recognizerRef.current.canceled = (s, e) => {
      console.log(`CANCELED: Reason=${e.reason}`)
      if (e.reason == CancellationReason.Error) {
        console.log(`"CANCELED: ErrorCode=${e.errorCode}`)
        console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`)
        console.log("CANCELED: Did you update the subscription info?")
      }
      recognizerRef.current.stopContinuousRecognitionAsync()
    }

    recognizerRef.current.sessionStopped = (s, e) => {
      console.log("\n    Session stopped event.")
      recognizerRef.current.stopContinuousRecognitionAsync()
    }

    recognizerRef.current.startContinuousRecognitionAsync()
    setIsRecording(true)
  }

  const stopRecognition = async () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync()
      setIsRecording(false)
      setIntermediateTranscript("")
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecognition()
    } else {
      setTranscript("") // Reset transcript when starting a new recording
      startRecognition()
    }
  }

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stopContinuousRecognitionAsync()
      }
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-screen w-screen bg-gray-900 text-gray-100">
      <div className="relative bg-black">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
      <ScrollArea className="h-full bg-gray-800 border-l border-r border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-4">Lorem Ipsum</h2>
        {highlightedTranscript}
      </ScrollArea>
      <div className="bg-gray-800 p-4 overflow-auto">
        <div className="grid gap-4">
          {highlights.map((high) => (
            <Card className={CardStyles[high.type]}>
              <CardHeader>
                <CardTitle className="text-gray-100">Box 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  This is an empty box. You can add content here.
                </p>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-100">Box 3</CardTitle>
              <CardTitle className="text-gray-100">Speech-to-Text</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                You can add more boxes or other components in this column.
              </p>
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
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-100">
                  Transcript:
                </h3>
                <p className="text-gray-100">
                  {transcript}
                  <span className="text-gray-400">
                    {intermediateTranscript}
                  </span>
                </p>
              </div>
            </CardContent>
            <Button
              onClick={() => {
                setHighlights(
                  [
                    ...highlights,
                    {
                      start: 17,
                      end: 25,
                      type: "true",
                    },
                  ].sort((a, b) => a.start - b.start),
                )
              }}
            >
              PRESS HERE
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

const CardStyles = {
  false:
    "border-2 border-red-500 bg-red-500 bg-opacity-50 rounded-lg animate-in",
  true: "border-2 border-green-500 bg-green-500 bg-opacity-50 rounded-lg animate-in",
  context:
    "border-2 border-blue-500 bg-blue-500 bg-opacity-50 rounded-lg animate-in",
}
