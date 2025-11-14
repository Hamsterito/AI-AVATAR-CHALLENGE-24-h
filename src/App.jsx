import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar/Sidebar';
import ChatArea from './components/ChatArea/ChatArea';
import AiArea from './components/AiArea/AiArea';
import './App.css';

const API_URL = 'http://localhost:8000';

const App = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadChats = async () => {
    try {
      const response = await axios.get(`${API_URL}/chats`);
      const chatsData = response.data.Chats || [];
      setChats(chatsData);
      return chatsData;
    } catch (err) {
      setError('Не удалось загрузить список чатов.');
      console.error(err);
      return [];
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${chatId}`);
      return (response.data.Chat_messages || []).map((msg, index) => [
        { id: `user-${index}`, sender: 'user', text: msg.question, time: msg.time },
        { id: `ai-${index}`, sender: 'ai', text: msg.answer, time: msg.time }
      ]).flat();
    } catch (err) {
      console.error("Ошибка при загрузке сообщений:", err);
      return [];
    }
  };
  
  // Загружаем чаты при первом запуске
  useEffect(() => {
    loadChats();
  }, []);

  const handleChatSelect = async (chat) => {
    if (activeChat?.Id === chat.Id) return;
    setActiveChat({ ...chat, messages: [] }); // Сразу показываем чат, пока грузятся сообщения
    setIsLoading(true);
    const messages = await loadMessages(chat.Id);
    setActiveChat({ ...chat, messages });
    setIsLoading(false);
  };

  // При нажатии "New Chat", мы просто скрываем правую колонку
  const handleNewChat = () => {
    setActiveChat(null);
  };

  // Внутри App.js

const handleSendMessage = async (message) => {
    let currentChatId = activeChat?.Id;
    const isNewChat = !currentChatId;

    if (isNewChat) {
      currentChatId = 'chat_' + Date.now();
    }

    // 1. Оптимистичное обновление: сразу показываем сообщение пользователя
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString()
    };
    
    if (isNewChat) {
      setActiveChat({
        Id: currentChatId,
        title: message.substring(0, 30) + '...',
        messages: [userMessage]
      });
    } else {
      setActiveChat(prev => ({ ...prev, messages: [...prev.messages, userMessage] }));
    }

    try {
      // 2. Отправляем запрос на бэкенд, ожидая получить аудио в ответ
      const response = await axios.post(`${API_URL}/chat`,
        { message, chat_id: currentChatId },
        { responseType: 'blob' }
      );

      // 3. Воспроизводим полученное аудио
      const audio = new Audio(URL.createObjectURL(response.data));
      audio.play();
      
      // 4. После ответа сервера, запрашиваем обновленный список сообщений
      //    (к этому моменту бэкенд уже сохранил ответ бота в БД)
      await loadChats(); 
      const finalMessages = await loadMessages(currentChatId);
      
      // 5. Обновляем состояние, чтобы отобразить ответ бота в текстовом виде
      setActiveChat(prev => ({...prev, Id: currentChatId, messages: finalMessages}));

    } catch (err) {
      setError('Ошибка при отправке сообщения.');
      console.error(err);
      // Здесь можно добавить логику отката оптимистичного обновления, если нужно
    }
  };

  return (
    <div className="app">
      <Sidebar 
        chats={chats} 
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />
      
      {/* Центральная колонка с кругом и полем ввода. ВСЕГДА на месте. */}
      <AiArea onSendMessage={handleSendMessage} />
      
      {/* Правая колонка с сообщениями. ПОЯВЛЯЕТСЯ только если чат выбран. */}
      {activeChat && <ChatArea chat={activeChat} isLoading={isLoading} />}
    </div>
  );
};

export default App;