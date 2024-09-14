import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
