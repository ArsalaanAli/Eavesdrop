import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import "regenerator-runtime/runtime"
import { socket } from "./lib/socket"

export default function Component() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [metadata, setMetadata] = useState("")
  const [webcamStream, setWebcamStream] = useState(null)
  const idx = useRef(-1)
  const camStream = useRef(null)

  const mediaRecorderRef = useRef(null)

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
    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
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

  return (
    <div className="relative w-screen min-h-screen flex justify-center items-center px-8">
      {/* Video Player 16:9 */}
      <div className="h-full aspect-video min-h-[280px] rounded-xl">
        <video
          className="w-full h-full object-cover rounded-xl"
          autoPlay
          muted
          ref={camStream}
        />
      </div>
      {/* Transcript */}
      <div className="h-full min-w-[25vw] min-h-[100vh] rounded-lg py-16 px-4">
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero, dolor
          nam voluptates veritatis incidunt accusamus eveniet, laboriosam
          voluptatibus ullam odit adipisci iusto quae quibusdam temporibus
          nostrum, modi deleniti. Recusandae tenetur a corrupti, quia repellat
          ipsum ex ipsam consequatur perspiciatis assumenda quo dolores nihil.
          Quidem corrupti, temporibus error earum eaque doloremque at maxime
          ipsa. Omnis quas libero illo quod eligendi corrupti natus distinctio
          dolorum et consequuntur, perspiciatis laborum saepe, maxime sunt!
          Nesciunt quos totam eaque ipsa, nisi fuga neque doloribus. Dolore
          aliquam totam dolor accusantium, recusandae nulla cupiditate nemo
          doloribus neque tenetur quas iure nesciunt at fugiat quis id incidunt
          voluptatem.
        </CardContent>
      </div>
      {/* Metadata */}
      <div className="h-full min-w-[25vw] min-h-[100vh] rounded-lg py-16 px-4">
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nam
          provident nulla quae voluptatum est fugit, id saepe consequatur
          veritatis eius.
        </CardContent>
      </div>
    </div>
  )

  // return (
  //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-screen w-screen bg-gray-900 text-gray-100">
  //     {/* ... existing video and ScrollArea components ... */}
  //     <div className="bg-gray-800 p-4 overflow-auto">
  //       <div className="grid gap-4">
  //         <Card className="bg-gray-700 border-gray-600">
  //           <CardHeader>
  //             <CardTitle className="text-gray-100">Audio Streaming</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <button
  //               onClick={toggleRecording}
  //               className={`px-4 py-2 rounded ${
  //                 isRecording ? "bg-red-600" : "bg-green-600"
  //               }`}
  //             >
  //               {isRecording ? "Stop Recording" : "Start Recording"}
  //             </button>
  //             <p className="text-gray-300 mt-2">
  //               {isRecording
  //                 ? "Recording and streaming audio..."
  //                 : "Click to start recording and streaming audio."}
  //             </p>
  //             <p className="text-gray-50 mt-2">{transcript}</p>
  //           </CardContent>
  //         </Card>
  //         {/* ... existing Card components ... */}
  //       </div>
  //     </div>
  //   </div>
  // )
}
