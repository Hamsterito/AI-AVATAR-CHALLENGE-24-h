import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar/Sidebar';
import ChatArea from './components/ChatArea/ChatArea';
import AiArea from './components/AiArea/AiArea';
import './App.css';

const App = () => {
  // --- Состояния ---
  const [chats, setChats] = useState([]);          // Список всех чатов
  const [activeChat, setActiveChat] = useState(null); // Текущий выбранный чат
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
 const loadChats = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/chats`);
      const chatsData = response.data.Chats || [];
      setChats(chatsData);
      return chatsData;
    } catch (err) {
      setError('Не удалось загрузить список чатов.');
      console.error(err);
      return [];
    }
  };
  // --- Загрузка списка чатов при монтировании ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Получаем список чатов
        const chatsResponse = await axios.get('http://localhost:8000/chats');
        const chatsData = chatsResponse.data.Chats;

        if (Array.isArray(chatsData) && chatsData.length > 0) {
          setChats(chatsData);

          // Выбираем первый чат как активный по умолчанию
          const defaultChat = chatsData[0];

          // Загружаем сообщения для этого чата
          const messagesResponse = await axios.get(`http://localhost:8000/messages/${defaultChat.Id}`);
          const messages = messagesResponse.data.Chat_messages || [];

          // Преобразуем сообщения в формат, который понимает ChatArea/Message
          const formattedMessages = messages.map((msg, index) => [
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

          setActiveChat({
            ...defaultChat,
            messages: formattedMessages
          });
        } else {
          setChats([]);
        }
      } catch (err) {
        setError('Не удалось загрузить данные. Попробуйте обновить страницу.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // --- Обработчик выбора чата ---
  const handleChatSelect = async (chat) => {
    if (activeChat?.Id === chat.Id) return;

    setIsLoading(true);
    setError(null);
    setActiveChat(null);

    try {
      const response = await axios.get(`http://localhost:8000/messages/${chat.Id}`);
      const messages = response.data.Chat_messages || [];

      const formattedMessages = messages.map((msg, index) => [
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

      setActiveChat({
        ...chat,
        messages: formattedMessages
      });
    } catch (err) {
      setError('Не удалось загрузить сообщения этого чата.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  // Создание нового чата
  const handleNewChat = () => {
    setActiveChat(null); // Очищаем область чата, чтобы показать AiArea
  };

  // Отправка сообщения
  const handleSendMessage = async (message) => {
    let currentChatId = activeChat?.Id;

    // Если чат еще не создан (первое сообщение в новом чате)
    if (!currentChatId) {
      currentChatId = 'chat_' + Date.now();
    }

    // Оптимистичное обновление: сразу показываем сообщение пользователя
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString()
    };
    // Если это новый чат, создаем временный активный чат
    const tempActiveChat = activeChat || { Id: currentChatId, title: message.substring(0, 30), messages: [] };
    
    setActiveChat({
      ...tempActiveChat,
      messages: [...tempActiveChat.messages, userMessage]
    });

    try {
      // Отправляем сообщение на сервер
      const response = await axios.post(`http://localhost:8000/chat`,
        { message: message, chat_id: currentChatId },
        { responseType: 'blob' } // Ожидаем аудио в ответе
      );

      // Воспроизводим аудио
      const audio = new Audio(URL.createObjectURL(response.data));
      audio.play();

      // После отправки обновляем список чатов и сообщения
      const updatedChats = await loadChats();
      
      // Находим ID чата (сервер мог создать новый)
      const sentChat = updatedChats.find(c => c.first_message === message) || updatedChats.find(c => c.Id === currentChatId) || updatedChats[0];

      if (sentChat) {
         // Загружаем актуальные сообщения, включая ответ бота
        const formattedMessages = await loadMessages(sentChat.Id);
        setActiveChat({
          ...sentChat,
          messages: formattedMessages,
        });
      }

    } catch (err) {
      setError('Ошибка при отправке сообщения.');
      console.error(err);
    }
  };


  return (
    <div className="app">
      <Sidebar 
        chats={chats} 
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
      />

      <AiArea />


      {activeChat && <ChatArea chat={activeChat} />}
    </div>
  );
};

export default App;
