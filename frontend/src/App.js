import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';

let socket

function MyButton({recording, onClick}) {
    return (
      <Button onClick={onClick}>{recording === 0 ? "Start Recording": "Stop Recording"}</Button>
    );
  }

function TranscriptText({transcript}) {
    return (
        <p className="TranscriptText">{transcript}</p>
    )
}

function App() {
    const [recording, setRecording] = useState(0);
    const [transcript, setTranscript] = useState("");
    let prev = "";
    let prev_time = 0;
    let query = "";

    function buttonClick() {
        if (recording === 0) {
            startStreaming()
        }
        else {
            stopAudio()
        }
        setRecording((recording + 1) % 2);
    }

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
              const result = JSON.parse(message.data)
              if (result.channel) {
                let transcription = result.channel.alternatives[0].transcript
                if (transcription) {
                    console.log(transcription)
                    setTranscript(prev + transcription)

                    if (Date.now() - prev_time > 3000 && transcription.length > 25) {
                        query = prev + transcription
                        prev_time = Date.now()
                        console.log("QUERY: ", query)
                        //Call to API here
                    }

                    if (result.is_final) {
                        if (result.speech_final) {
                            prev = ""
                            if (!transcription.match(/[\.!?]$/)) {
                                transcription += '.'
                            }
                        }
                        else {
                            prev += transcription + " "
                        }
                    }

                }
              }
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

    return (
        <div className="App">
            
            <p>
                Speech Recognition test
            </p>
            
            
            <MyButton recording={recording} onClick={buttonClick}/>
            <TranscriptText transcript={transcript}/>

        
        </div>
    );
}

export default App;
