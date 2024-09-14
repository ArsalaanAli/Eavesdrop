import socket
import queue
host_name = socket.gethostname()
host_ip = '127.0.0.1'#  socket.gethostbyname(host_name)
print(host_ip)
port = 3000
# For details visit: www.pyshine.com
q = queue.Queue(maxsize=2000)

BUFF_SIZE = 65536
client_socket = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
client_socket.setsockopt(socket.SOL_SOCKET,socket.SO_RCVBUF,BUFF_SIZE)
# p = pyaudio.PyAudio()
CHUNK = 10*1024
# stream = p.open(format=p.get_format_from_width(2),
# 				channels=2,
# 				rate=44100,
# 				output=True,
# 				frames_per_buffer=CHUNK)
                
# create socket
message = b'Hello'
client_socket.settimeout(5)
client_socket.sendto(message,(host_ip,port))
socket_address = (host_ip,port)
while True:
    frame = client_socket.recv(BUFF_SIZE)
    q.put(frame)
    print(f"Queue size: {q.qsize()}")