import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AudioConfig,
  CancellationReason,
  ResultReason,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk"
import { useEffect, useRef, useState } from "react"
import "regenerator-runtime/runtime"
import { v4 as uuid } from "uuid"
import { Button } from "./components/ui/button"
import { ScrollArea } from "./components/ui/scroll-area"
import { GetHighlightedTranscript } from "./lib/helpers"
import { socket } from "./lib/socket"

const SPEECH_KEY = import.meta.env.VITE_SPEECH_KEY
const SPEECH_REGION = import.meta.env.VITE_SPEECH_REGION

const typeToTitle = {
  false: "Be Careful 🚨",
  true: "This is True ✅",
  context: "Here's Some Context 🧭",
}

const defaultHighlights = [
  {
    highlight: "test text end more",
    id: 1,
    type: "false",
    citations: [
      "https://www.google.com/search?q=free+gemini+tokens",
      "https://www.reddit.com/r/Gemini/",
      "https://twitter.com/search?q=gemini+free+tokens",
    ],
    content:
      "Some Gemini platforms offer a limited number of free tokens for a certain period.",
    truthiness: 0.5,
  },
  {
    highlight: "dont know what to write",
    id: 2,
    type: "true",
    citations: [
      "https://www.google.com/search?q=free+gemini+tokens",
      "https://www.reddit.com/r/Gemini/",
      "https://twitter.com/search?q=gemini+free+tokens",
    ],
    content:
      "Some Gemini platforms offer a limited number of free tokens for a certain period.",
    truthiness: 0.5,
  },
]

export default function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [intermediateTranscript, setIntermediateTranscript] = useState("")
  const [highlightedTranscript, setHighlightedTranscript] = useState([])

  const idx = useRef(-1)
  const camStream = useRef(null)
  const recognizerRef = useRef(null)
  const [focused, setFocused] = useState(-1)
  const scrollAreaRef = useRef(null)
  const [highlights, setHighlights] = useState([])

  const curIteration = useRef(0)

  useEffect(() => {
    const getWebcamStream = async () => {
      camStream.current.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
      })
      camStream.current.play()
    }

    getWebcamStream()
  }, [])

  useEffect(() => {
    if (!(transcript && highlights)) return
    curIteration.current += 1
    setHighlightedTranscript(GetHighlightedTranscript(transcript, highlights))
    scrollAreaRef.current.scrollTo({
      top: scrollAreaRef.current.scrollHeight,
      behavior: "smooth"
    })
  }, [highlights, transcript])

  const startRecognition = async () => {
    const speechConfig = SpeechConfig.fromSubscription(
      SPEECH_KEY,
      SPEECH_REGION,
    )
    speechConfig.speechRecognitionLanguage = "en-US"

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput()
    recognizerRef.current = new SpeechRecognizer(speechConfig, audioConfig)
    socket.connect()

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
        socket.emit("text", e.result.text)
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
      socket.disconnect()
    }

    recognizerRef.current.sessionStopped = (s, e) => {
      console.log("\n    Session stopped event.")
      recognizerRef.current.stopContinuousRecognitionAsync()
      socket.disconnect()
    }

    socket.on("transcript", (transcript) => {
      const delimeter = transcript.indexOf(",")
      const text = transcript.substring(delimeter + 1)
      if (idx.current === -1) {
        idx.current = parseInt(transcript.substring(0, delimeter))
      }

      setTranscript((prev) => [...prev, text])
    })

    socket.on("highlight", (highlights) => {
      console.log(`Received highlights: ${highlights}`)
      // highlights["id"] = uuid()
      const newHighlights = highlights.filter((high) => high.highlight.length > 0).map((high) => {
        high["id"] = uuid()
        return high
      })

      setHighlights((prev) => [...prev, ...newHighlights])
    })

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

  useEffect(() => {
    console.log(highlights);
    setHighlightedTranscript(
      GetHighlightedTranscript(transcript, highlights, setFocused),
    )
  }, [highlights, transcript])

  return (
    <div className="relative w-screen min-h-screen flex flex-col justify-center items-center px-8">
      <div className="pt-16 flex gap-2 justify-center items-center w-screen">
        {" "}
        <h3 className="text-3xl font-bold">
          <span className="text-sm">ummm...</span>Actually
        </h3>
        <img
          src={"/actually-logo.jpeg"}
          alt="Actually Logo"
          className="object-contain h-32"
        />
      </div>
      <div className="flex gap-4 justify-center items-center w-screen px-8">
        {/* Video Player 16:9 */}
        <div className="h-full aspect-video min-w-[43vw] rounded-xl">
          <video
            className="w-full h-full object-cover rounded-xl"
            autoPlay
            muted
            ref={camStream}
          />
          <Button onClick={toggleRecording} className="my-4">
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>
        {/* Transcript */}
        <Card className="h-[78vh] min-w-[10vw] max-w-[25vw]">
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[69vh] w-full">
              {highlightedTranscript}
              <span className="text-gray-400">{intermediateTranscript}</span>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="h-[78vh] min-w-[25vw]">
          {focused}
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2" ref={scrollAreaRef}>
            <ScrollArea className="h-[69vh] w-full">
              {highlights && highlights.map((high, index) => {
                const type =
                  high.truthiness < 0.33
                    ? "false"
                    : high.truthiness > 0.66
                    ? "true"
                    : "context"
                  

                return (
                  <Card
                    key={index}
                    className={
                      high.id === focused
                        ? FocusedCardStyles[type]
                        : CardStyles[type]
                    }
                  >
                    <CardHeader>
                      <CardTitle className="">{typeToTitle[type]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="">{high.content}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const CardStyles = {
  false:
    "border-2 border-red-300 hover:bg-red-300 cursor-pointer bg-red-100 bg-opacity-50 rounded-lg animate-in transition-all duration-150",
  true: "border-2 border-green-300 hover:bg-green-300 cursor-pointer bg-green-100 bg-opacity-50 rounded-lg animate-in transition-all duration-150",
  context:
    "border-2 border-blue-300 hover:bg-blue-300 cursor-pointer bg-blue-100 bg-opacity-50 rounded-lg animate-in transition-all duration-150",
}

const FocusedCardStyles = {
  false:
    "border-2 border-red-300 bg-red-500 cursor-pointer bg-opacity-50 rounded-lg animate-in transition-all duration-150",
  true: "border-2 border-green-300 bg-green-300 cursor-pointer bg-opacity-50 rounded-lg animate-in transition-all duration-150",
  context:
    "border-2 border-blue-300 bg-blue-300 cursor-pointer bg-opacity-50 rounded-lg animate-in transition-all duration-150",
}
