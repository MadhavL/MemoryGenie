import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';

let socket

function startStreaming() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const mediaRecorder = new MediaRecorder(stream)
        console.log("Opened Microphone")

        socket = new WebSocket('wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true&model=nova-2&endpointing=150', [ 'token', '55c148996afae2c820da7699bd598492016434d2' ])

        socket.onopen = () => {
          console.log("Opened Web Socket")
        //   document.querySelector('#status').textContent = 'Connected'
          mediaRecorder.addEventListener('dataavailable', event => {
            if (event.data.size > 0 && socket.readyState === 1) {
              socket.send(event.data)
            }
          })
          mediaRecorder.start(100)
        }

        socket.onmessage = (message) => {
          const received = JSON.parse(message.data)
          if (received.channel) {
            const transcript = received.channel.alternatives[0].transcript
             console.log(transcript)
          }
          
        //   if (transcript && received.is_final) {
        //     document.querySelector('#transcript').textContent += transcript + ' '
        //   }
        }

        socket.onclose = () => {
          console.log("Closed Stream")
          mediaRecorder.stop()
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          console.log("Closed Microphone")
        }

        socket.onerror = (error) => {
          console.log({ event: 'onerror', error })
        }
      })
}

function stopAudio() {
    socket.send(JSON.stringify({
        "type": "CloseStream"
    }))
}

function MyButton({recording, onClick}) {
    return (
      <Button onClick={onClick}>{recording === 0 ? "Start Recording": "Stop Recording"}</Button>
    );
  }

function App() {
    const [recording, setRecording] = useState(0);
    function buttonClick() {
        if (recording === 0) {
            startStreaming()
        }
        else {
            stopAudio()
        }
        setRecording((recording + 1) % 2);
    }
    return (
        <div className="App">
            
            <p>
                Speech Recognition test
            </p>
            
            
            <MyButton recording={recording} onClick={buttonClick}/>

        
        </div>
    );
}

export default App;
