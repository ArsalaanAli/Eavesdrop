import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import "regenerator-runtime/runtime"
import { ScrollArea } from "./components/ui/scroll-area"
import { GetHighlightedTranscript } from "./lib/helpers"
import { socket } from "./lib/socket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import "regenerator-runtime/runtime";
import { GetHighlightedTranscript } from "./lib/helpers";
import { socket } from "./lib/socket";
import logo from "/actually-logo.jpeg";
import { v4 as uuid } from "uuid";
import { ScrollArea } from "./components/ui/scroll-area";

const typeToTitle = {
  false: "Be Careful 🚨",
  true: "This is True ✅",
  context: "Here's Some Context 🧭",
};

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [metadata, setMetadata] = useState("");
  const [webcamStream, setWebcamStream] = useState(null);
  const [transcript, setTranscript] = useState(
    "test text end more rnadom text here i dont know what to write text"
  );

  const idx = useRef(-1);
  const camStream = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [focused, setFocused] = useState();

  const [highlights, setHighlights] = useState([
    { start: 0, end: 10, id: 1, type: "false" },
    { start: 11, end: 20, id: 2, type: "true" },
    { start: 21, end: 30, id: 3, type: "context" },
    { start: 31, end: 40, id: 4, type: "false" },
    { start: 41, end: 50, id: 5, type: "false" },
  ]);
  const [highlightedTranscript, setHighlightedTranscript] = useState([]);

  var curIteration = useRef(0);

  useEffect(() => {
    const getWebcamStream = async () => {
      camStream.current.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      camStream.current.play();
    };

    getWebcamStream();
  }, []);

  useEffect(() => {
    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaRecorderRef.current = new MediaRecorder(stream);
      socket.connect();

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          socket.emit("audio_data", event.data);
          console.log("Audio data sent:", event.data.size, "bytes");
        }
      };

      mediaRecorderRef.current.onstop = () => {
        socket.disconnect();
      };

      socket.on("transcript", (transcript) => {
        console.log("Transcript received:", transcript);
        const delimeter = transcript.indexOf(",");
        const text = transcript.substring(delimeter + 1);
        if (idx.current === -1) {
          idx.current = parseInt(transcript.substring(0, delimeter));
        }

        setTranscript((prev) => [...prev, text]);
      });

      socket.on("metadata", (metadata) => {
        console.log("Metadata received:", metadata);
        metadata["id"] = uuid();
        if (idx.current === -1) {
          setMetadata((prev) => [...prev, metadata]);
          return;
        }

        const newMetadata = metadata.map((m) => {
          return {
            ...m,
            start: m.start - idx.current,
            end: m.end - idx.current,
          };
        });

        setMetadata((prev) => [...prev, newMetadata]);
      });

      mediaRecorderRef.current.start(100);
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };

    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      stopRecording();
    };
  }, [isRecording]);

  useEffect(() => {
    console.log(highlights);
    setHighlightedTranscript(
      GetHighlightedTranscript(transcript, highlights, setFocused)
    );
  }, [highlights, transcript]);

  return (
    <div className="relative w-screen min-h-screen flex flex-col justify-center items-center px-8">
      <div className="pt-16 flex gap-2 justify-center items-center w-screen">
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
        </div>
        {/* Transcript */}
        <div className="h-full min-w-[10vw] max-w-[25vw] min-h-[80vh] rounded-lg py-16 px-4">
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea>{highlightedTranscript}</ScrollArea>
          </CardContent>
        </div>
        {/* Metadata */}
        {focused}
        <div className="h-full min-w-[25vw] min-h-[80vh] rounded-lg py-16 px-4">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {highlights.map((high, index) => (
              <Card
                key={index}
                className={
                  high.id === focused
                    ? FocusedCardStyles[high.type]
                    : CardStyles[high.type]
                }
              >
                <CardHeader>
                  <CardTitle className="">{typeToTitle[high.type]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="">
                    {high.start} - {high.end}
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </div>
      </div>
    </div>
  );
}

const CardStyles = {
  false:
    "border-2 border-red-300 hover:bg-red-300 cursor-pointer bg-red-100 bg-opacity-50 rounded-lg animate-in transition-all duration-150",
  true: "border-2 border-green-300 hover:bg-green-300 cursor-pointer bg-green-100 bg-opacity-50 rounded-lg animate-in transition-all duration-150",
  context:
    "border-2 border-blue-300 hover:bg-blue-300 cursor-pointer bg-blue-100 bg-opacity-50 rounded-lg animate-in transition-all duration-150",
};

const FocusedCardStyles = {
  false:
    "border-2 border-red-300 bg-red-500 cursor-pointer bg-opacity-50 rounded-lg animate-in transition-all duration-150",
  true: "border-2 border-green-300 bg-green-300 cursor-pointer bg-opacity-50 rounded-lg animate-in transition-all duration-150",
  context:
    "border-2 border-blue-300 bg-blue-300 cursor-pointer bg-opacity-50 rounded-lg animate-in transition-all duration-150",
};
