import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatArea from './components/ChatArea/ChatArea';
import { initialChats } from './data/chatsData';
import './App.css';

const App = () => {
  const [chats] = useState(initialChats);
  const [activeChat, setActiveChat] = useState(chats[0]);

  return (
    <div className="app">
      <Sidebar 
        chats={chats} 
        activeChat={activeChat}
        onChatSelect={setActiveChat}
      />
      <ChatArea chat={activeChat} />
    </div>
  );
};

export default App;