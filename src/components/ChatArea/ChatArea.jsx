import { useEffect, useState } from 'react';
import Message from './Message';
import './ChatArea.css';
import axios from 'axios';

const ChatArea = ({ chat }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
  if (chat?.Id) {
    axios.get(`http://localhost:8000/messages/${chat.Id}`)
      .then(response => {
        console.log("Ответ сервера:", response.data);
        const chatMessages = response.data.Chat_messages || []; // гарантируем массив

        const formattedMessages = chatMessages.map((msg, index) => [
          {
            id: `user-${index}`,
            sender: 'user',
            text: msg.question,
            time: msg.time
          },
          {
            id: `ai-${index}`,
            sender: 'ai',
            text: msg.answer,
            time: msg.time
          }
        ]).flat();

        setMessages(formattedMessages);
      })
      .catch(err => {
        console.error("Ошибка при загрузке сообщений:", err);
        setMessages([]); // сбросить сообщения при ошибке
      });
  }
}, [chat]);


  return (
    <div className="chat-area">
      <div className="chat-header">
        <h2>Conversation</h2>
        <p>{chat?.title || ''}</p>
      </div>

      <div className="messages-container">
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
};
export default ChatArea;
