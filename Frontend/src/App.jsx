import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useSpeechRecognition,
  SpeechRecognition,
} from "react-speech-recognition"

export default function Component() {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

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
        <p className="mb-4">{transcript}</p>
        <p className="mb-4">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
          do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <p>
          Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam
          varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus
          magna felis sollicitudin mauris. Integer in mauris eu nibh euismod
          gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis
          risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue,
          eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas
          fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla
          a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis,
          neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing
          sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque
          nunc. Nullam arcu. Aliquam consequat.
        </p>
        <p>
          Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam
          varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus
          magna felis sollicitudin mauris. Integer in mauris eu nibh euismod
          gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis
          risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue,
          eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas
          fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla
          a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis,
          neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing
          sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque
          nunc. Nullam arcu. Aliquam consequat.
        </p>
        <p>
          Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam
          varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus
          magna felis sollicitudin mauris. Integer in mauris eu nibh euismod
          gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis
          risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue,
          eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas
          fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla
          a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis,
          neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing
          sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque
          nunc. Nullam arcu. Aliquam consequat.
        </p>
        <p>
          Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam
          varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus
          magna felis sollicitudin mauris. Integer in mauris eu nibh euismod
          gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis
          risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue,
          eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas
          fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla
          a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis,
          neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing
          sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque
          nunc. Nullam arcu. Aliquam consequat.
        </p>
      </ScrollArea>
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
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-100">Box 3</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p>Microphone: {listening ? "on" : "off"}</p>
                <button onClick={SpeechRecognition.startListening}>
                  Start
                </button>
                <button onClick={SpeechRecognition.stopListening}>Stop</button>
                <button onClick={resetTranscript}>Reset</button>
                <p>{transcript}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
