import { useState } from "react";
import { Mic, CircleStop, Send } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import "./InputArea.css";

const InputArea = () => {
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState("");

  const recorder = VoiceRecorder({
    onTextReceived: (text) => {
      setMessage(text); // вставляем распознанный текст в input
    },
  });

  const handleMicClick = () => {
    if (!recording) {
      recorder.start();
    } else {
      recorder.stop();
    }
    setRecording(!recording);
  };

  const handleSendClick = () => {
    if (!message.trim()) return;
    console.log("Send message:", message);
    setMessage(""); // очищаем поле после отправки
  };

  return (
    <div className="input-area">
      <input
        type="text"
        placeholder="Ask a question or use the microphone"
        className="message-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        className={`mic-btn ${recording ? "recording" : ""}`}
        onClick={handleMicClick}
        title={recording ? "Stop recording" : "Start recording"}
      >
        {recording ? <CircleStop size={20} /> : <Mic size={20} />}
      </button>

      <button className="send-btn" onClick={handleSendClick} title="Send message">
        <Send size={20} />
      </button>
    </div>
  );
};

export default InputArea;
