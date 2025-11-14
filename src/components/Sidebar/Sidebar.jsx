import { Settings, HelpCircle } from 'lucide-react';
import ChatItem from './ChatItem';
import './Sidebar.css';

const Sidebar = ({ chats, activeChat, onChatSelect }) => {
  return (
    <div className="sidebar">
      <div className="chat-list">
        {chats.map(chat => (
          <ChatItem
            key={chat.Id}
            chat={chat}
            isActive={activeChat?.Id === chat.Id}
            onClick={() => onChatSelect(chat)}
          />
        ))}
      </div>
      
      <div className="sidebar-footer">
        <button className="new-chat-btn">New Chat</button>
        <button className="icon-btn">
          <Settings size={20} />
          <span>Setting</span>
        </button>
        <button className="icon-btn">
          <HelpCircle size={20} />
          <span>Help</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
