import 'regenerator-runtime/runtime'
import { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { io } from 'socket.io-client';

export default function Component() {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)

  useEffect(() => {
    let socket = null

    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      const socket = io('http://127.0.0.1:5000');
      

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          socket.emit('audio_data', event.data);
          console.log('Audio data sent:', event.data.size, 'bytes');
        }
      }

      mediaRecorderRef.current.start(100)
    }

    const stopRecording = () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      if (socket) {
        socket.close()
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
    setIsRecording(!isRecording)
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
                  isRecording ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              <p className="text-gray-300 mt-2">
                {isRecording ? 'Recording and streaming audio...' : 'Click to start recording and streaming audio.'}
              </p>
            </CardContent>
          </Card>
          {/* ... existing Card components ... */}
        </div>
      </div>
    </div>
  )
}