import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import Highlighter from "react-highlight-words";

const URL = "http://127.0.0.1:8000" //https://neat-teeth-bet.loca.lt"; //NEED TO REPLACE WITH LOCALTUNNEL URL
let socket
let queryModeFlag = 0
const CONVERSATION_END_TIME = 15000
let savingEnabled = 0;

function MyButton({recording, onClick}) {
    return (
      <Button style={{marginBottom:15}} onClick={onClick}>{recording === 0 ? "Start Recording": "Stop Recording"}</Button>
    );
  }

function ConversationSwitch({onClick}) {
    return (
        <Form>
        <Form.Check // prettier-ignore
            type="switch"
            id="conversation-switch"
            label="See relevant conversations"
            onClick={onClick}
        />
        </Form>
    );
}

function SaveSwitch({onClick}) {
    return (
        <Form>
        <Form.Check // prettier-ignore
            type="switch"
            id="save-switch"
            label="Save conversations in database"
            onClick={onClick}
        />
        </Form>
    );
}

function QueryModeSelector({onChange, mode}) {
    return (
      <Form style={{marginTop: 10}}>
        Query Mode
        <Form.Check
            
            label="Sentence->Conversation"
            type="radio"
            name="group1"
            id="inline-radio-1"
            checked={mode == 0}
            onChange={onChange}
            value={0}
        />
        <Form.Check
            
            label="Sentence->Sentence"
            type="radio"
            name="group1"
            id="inline-radio-2"
            checked={mode == 1}
            onChange={onChange}
            value={1}
        />
        <Form.Check
            
            label="Conversation->Conversation"
            type="radio"
            name="group1"
            id="inline-radio-3"
            checked={mode == 2}
            onChange={onChange}
            value={2}
        />
      </Form>
    );
  }

function TranscriptText({transcriptText}) {
    return (
        <p className="TranscriptText">{transcriptText}</p>
    )
}

function ConversationHighlighter({conversation, sentence, enabled}) {
    return(
    <Highlighter
        className="HighlightedText"
        searchWords={[sentence]}
        autoEscape={true}
        textToHighlight={conversation}
        style={{ visibility: enabled ? "visible" : "hidden" }}
    />
    )
}

async function query_sentence_to_conversation (text){
    if (text) {
        try {
            let request = await fetch(URL+ "/query-sentence-conversation/", {
                method: "post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "Bypass-Tunnel-Reminder": "anything",
                },
                body: JSON.stringify({query: text})
            });
            const jsonData = JSON.parse(await request.json());
            return jsonData
        }
        catch (error) {
            console.error(error);
        }
    }
  
}

async function query_sentence_to_sentence (text){
    if (text) {
        try {
            let request = await fetch(URL+ "/query-sentence-sentence/", {
                method: "post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "Bypass-Tunnel-Reminder": "anything",
                },
                body: JSON.stringify({query: text})
            });
            const jsonData = JSON.parse(await request.json());
            return jsonData
        }
        catch (error) {
            console.error(error);
        }
    }
  
}

async function query_conversation_to_conversation (text){
    if (text) {
        try {
            let request = await fetch(URL+ "/query-conversation-conversation/", {
                method: "post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "Bypass-Tunnel-Reminder": "anything",
                },
                body: JSON.stringify({query: text})
            });
            const jsonData = JSON.parse(await request.json());
            return jsonData
        }
        catch (error) {
            console.error(error);
        }
    }
  
}

async function update_db (text, type, id){
    if (text) {
        try {
            let request = await fetch(URL+ "/update-db/", {
                method: "post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "Bypass-Tunnel-Reminder": "anything",
                },
                body: JSON.stringify({text: text,
                    type: type,
                    id: id})
            });
            const jsonData = JSON.parse(await request.json());
            return jsonData
        }
        catch (error) {
            console.error(error);
        }
    }
  
}



function App() {
    const [recording, setRecording] = useState(0);
    const [transcriptText, setTranscriptText] = useState("");
    const [relevantConversation, setRelevantConversation] = useState("");
    const [relevantSentence, setRelevantSentence] = useState("");
    const [enabled, setEnabled] = useState(0);
    // const [savingEnabled, setSavingEnabled] = useState(0);
    const [queryMode, setQueryMode] = useState(0);
    let prev = "";
    let prev_time = 0;
    let query = "";
    let conversation = "";
    let sentence = "";
    let prev_conversation = "";
    let all_sentences = [];
    let prev_transcription_time = 0;
    

    function buttonClick() {
        if (recording === 0) {
            startStreaming()
        }
        else {
            stopAudio()
        }
        setRecording((recording + 1) % 2);
    }

    function switchToggled() {
        setEnabled((enabled + 1) % 2);
    }

    function saveSwitchToggled() {
        // setSavingEnabled((savingEnabled + 1) % 2);
        savingEnabled = (savingEnabled + 1) % 2;
    }

    function modeChange(event) {
        queryModeFlag = event.target.value
        setQueryMode(event.target.value)
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
              prev_transcription_time = Date.now()
            }
    
            socket.onmessage = async (message) => {
              const result = JSON.parse(message.data)
              if (result.channel) {
                let transcription = result.channel.alternatives[0].transcript
                if (transcription) {
                    prev_transcription_time = Date.now()
                    console.log(transcription)
                    sentence = prev + transcription
                    conversation = prev_conversation + sentence

                    console.log(queryModeFlag)
                    if (queryModeFlag == 0) {
                        setTranscriptText(sentence)

                        if (Date.now() - prev_time > 3000 && transcription.length > 25) {
                            prev_time = Date.now()
                            console.log("QUERY: ", sentence)
                            const apiResult = await query_sentence_to_conversation(sentence)
                            console.log(apiResult)
                            const conversationResult = apiResult.conversation
                            if (conversationResult) {
                                const sentenceResult = apiResult.relevant_sentences
                                setRelevantConversation(conversationResult)
                                setRelevantSentence(sentenceResult[0])
                            }
                        }
                    }
                    else if (queryModeFlag == 1) {
                        setTranscriptText(sentence)

                        if (Date.now() - prev_time > 3000 && transcription.length > 25) {
                            prev_time = Date.now()
                            console.log("QUERY: ", sentence)
                            const apiResult = await query_sentence_to_sentence(sentence)
                            console.log(apiResult)
                            const sentenceResult = apiResult.relevant_sentences
                            if (sentenceResult && sentenceResult[0]) {
                                setRelevantConversation(sentenceResult[0])
                            }
                        }
                    }
                    else if (queryModeFlag == 2) {
                        setTranscriptText(conversation)

                        if (Date.now() - prev_time > 3000 && transcription.length > 25) {
                            prev_time = Date.now()
                            console.log("QUERY: ", conversation)
                            const apiResult = await query_conversation_to_conversation(conversation)
                            console.log(apiResult)
                            const conversationResult = apiResult.conversation
                            if (conversationResult) {
                                setRelevantConversation(conversationResult)
                            }
                        }
                    }

                    if (result.is_final) {
                        if (result.speech_final) {
                            all_sentences.push(sentence)
                            prev_conversation += sentence
                            prev = ""
                            if (!transcription.match(/[\.!,?]$/)) {
                                prev_conversation += '.'
                            }
                            prev_conversation += " "                          
                        }
                        else {
                            prev += transcription + " "
                        }
                    }

                }
                else {
                    if (Date.now() - prev_transcription_time > CONVERSATION_END_TIME) {
                        stopAudio();
                        setRecording(0);
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
              if (savingEnabled) {
                console.log("Saving transcript")
                const conv_id = Date.now().toString();
                if (conversation) {
                    update_db([conversation], "full", conv_id)
                }
                
                if (all_sentences) {
                    update_db(all_sentences, "sentence", conv_id)
                }
                
                
              }
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
        <div className='AppRow'>
            <div className="Settings">
                <MyButton recording={recording} onClick={buttonClick}/>
                <SaveSwitch onClick={saveSwitchToggled}/>
                <ConversationSwitch onClick={switchToggled}/>
                <QueryModeSelector onChange={modeChange} mode={queryMode}/>
            </div>
            
            <div className="TextDisplay">
                <TranscriptText transcriptText={transcriptText}/>    
                <ConversationHighlighter conversation={relevantConversation} sentence={relevantSentence} enabled={enabled}/>
            </div>
        </div>
    );
}

export default App;