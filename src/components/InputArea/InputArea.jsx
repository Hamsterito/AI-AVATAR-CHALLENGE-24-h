import { Paperclip, Mic } from 'lucide-react';
import './InputArea.css';

const InputArea = () => {
  return (
    <div className="input-area">
      <input 
        type="text" 
        placeholder="Ask a question or use the microphone"
        className="message-input"
      />
      <button className="attach-btn">
        <Paperclip size={20} />
      </button>
      <button className="mic-btn">
        <Mic size={20} />
      </button>
      <button className="send-btn">Send</button>
    </div>
  );
};

export default InputArea;