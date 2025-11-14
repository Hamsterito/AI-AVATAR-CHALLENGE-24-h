import InputArea from '../InputArea/InputArea';
import './AiArea.css';

const AiArea = () => {
  
    return (
      <div className="ai-area">
        <div className="empty-chat">
          <div className="empty-circle"></div>
        </div>
        <InputArea />
      </div>
    );
  }

export default AiArea;