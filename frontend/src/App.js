import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

function recordAudio() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        console.log({ stream })
        // Further code goes here
      })
}

function MyButton() {
    return (
      <Button>Start Recording</Button>
    );
  }

function App() {
  return (
    <div className="App">
        
        <p>
            Speech Recognition test
        </p>
        
        
        <MyButton />

      
    </div>
  );
}

export default App;
