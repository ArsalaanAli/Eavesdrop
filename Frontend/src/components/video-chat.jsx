'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendIcon } from 'lucide-react'

export function VideoChat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! Welcome to the video chat.", sender: "bot" },
    { id: 2, text: "Hi there! Thanks for having me.", sender: "user" },
  ])
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (inputMessage.trim() !== "") {
      setMessages(
        [...messages, { id: messages.length + 1, text: inputMessage, sender: "user" }]
      )
      setInputMessage("")
    }
  }

  return (
    (<div className="grid grid-cols-1 md:grid-cols-2 h-screen">
      <div className="relative bg-black">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="https://cdn.pixabay.com/vimeo/328940142/earth-24536.mp4?width=640&hash=e4d2a0c5e4d4f4f3c3c5e3c3c5e3c3c5e3c3c5e3"
          autoPlay
          loop
          muted
          playsInline />
      </div>
      <div className="flex flex-col bg-background">
        <ScrollArea className="flex-grow p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } mb-4`}>
              <div
                className={`flex items-start ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{message.sender === "user" ? "U" : "B"}</AvatarFallback>
                </Avatar>
                <div
                  className={`mx-2 px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
                  {message.text}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow" />
            <Button type="submit" size="icon">
              <SendIcon className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </div>
    </div>)
  );
}