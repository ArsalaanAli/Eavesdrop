import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SendIcon } from "lucide-react";

export default function Component() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! Welcome to the video chat.", sender: "bot" },
    { id: 2, text: "Hi there! Thanks for having me.", sender: "user" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== "") {
      setMessages([
        ...messages,
        { id: messages.length + 1, text: inputMessage, sender: "user" },
      ]);
      setInputMessage("");
    }
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
      <div className="flex flex-col bg-gray-800 border-l border-r border-gray-700">
        <ScrollArea className="flex-grow p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`flex items-start ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {message.sender === "user" ? "U" : "B"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`mx-2 px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-gray-700"
        >
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow bg-gray-700 text-gray-100 placeholder-gray-400 border-gray-600"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <SendIcon className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </div>
      <div className="bg-gray-800 p-4 overflow-auto">
        <div className="grid gap-4">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-100">Box 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                This is an empty box. You can add content here.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-100">Box 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                This is another empty box. Feel free to customize it.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-100">Box 3</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                You can add more boxes or other components in this column.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
