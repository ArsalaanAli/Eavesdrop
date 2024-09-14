import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import "regenerator-runtime/runtime"
import { socket } from "./lib/socket"

export default function Component() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [metadata, setMetadata] = useState("")

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
        setTranscript((prev) => [...prev, transcript])
      })

      socket.on("metadata", (metadata) => {
        console.log("Metadata received:", metadata)
        const sample = {
          chunk: [0, 15],
          highlights: [
            {
              type: "text",
              start: 0,
              end: 15,
            },
          ],
        }

        setMetadata((prev) => [...prev, metadata])
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
              <p className="text-gray-300 mt-2">
                {isRecording
                  ? "Recording and streaming audio..."
                  : "Click to start recording and streaming audio."}
              </p>
            </CardContent>
          </Card>
          {/* ... existing Card components ... */}
        </div>
      </div>
    </div>
  )
}
