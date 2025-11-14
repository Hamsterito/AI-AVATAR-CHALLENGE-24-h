import InputArea from '../InputArea/InputArea';
import './AiArea.css';

// Принимаем onSendMessage и передаем его в InputArea
const AiArea = ({ onSendMessage }) => {
  return (
    <div className="ai-area">
      <div className="empty-chat">
        {/* Это ваш большой декоративный круг */}
        <div className="empty-circle"></div>
      </div>
      <InputArea onSendMessage={onSendMessage} />
    </div>
  );
}

export default AiArea;