import Message from './Message';
import InputArea from '../InputArea/InputArea';
import './ChatArea.css';

const ChatArea = ({ chat }) => {
  if (!chat) {
    return (
      <div className="chat-area">
        <div className="empty-chat">
          <div className="empty-circle"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <h2>Conversation</h2>
        <p>{chat.title}</p>
      </div>
      
      <div className="messages-container">
        {chat.messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
      </div>
      
      <InputArea />
    </div>
  );
};

export default ChatArea;