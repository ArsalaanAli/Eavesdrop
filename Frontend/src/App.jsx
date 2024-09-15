import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import "regenerator-runtime/runtime";
import { socket } from "./lib/socket";
import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { GetHighlightedTranscript } from "./lib/helpers";

export default function App() {
  const [transcript, setTranscript] = useState(
    "test text end more rnadom text here i dont know what to write text"
  );

  const [highlights, setHighlights] = useState([
    { start: 5, end: 15, type: "false" },
  ]);

  const [highlightedTranscript, setHighlightedTranscript] = useState([]);

  var curIteration = useRef(0);

  useEffect(() => {
    curIteration.current += 1;
    console.log(curIteration.current);
    console.log(highlights);
    setHighlightedTranscript(
      GetHighlightedTranscript(transcript, highlights, curIteration)
    );
  }, [highlights]);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [metadata, setMetadata] = useState("");
  const idx = useRef(-1);

  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };

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
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                You can add more boxes or other components in this column.
              </p>
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
                  ].sort((a, b) => a.start - b.start)
                );
              }}
            >
              PRESS HERE
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

const CardStyles = {
  false:
    "border-2 border-red-500 bg-red-500 bg-opacity-50 rounded-lg animate-in",
  true: "border-2 border-green-500 bg-green-500 bg-opacity-50 rounded-lg animate-in",
  context:
    "border-2 border-blue-500 bg-blue-500 bg-opacity-50 rounded-lg animate-in",
};
