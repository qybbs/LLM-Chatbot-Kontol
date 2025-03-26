import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { backend } from 'declarations/backend';
import botImg from '/bot.svg';
import userImg from '/user.svg';
import '/index.css';

const App = () => {
  const [chat, setChat] = useState([
    {
      role: { system: null },
      content: `Halo! Saya Asisten Negosiasi B2B AI Anda. Ada yang bisa saya bantu hari ini?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
  };

  const askAgent = async (messages) => {
    try {
      const response = await backend.chat(messages);
      setChat((prevChat) => [...prevChat, { role: { system: null }, content: response }]);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: { user: null }, content: inputValue };
    setChat((prevChat) => [...prevChat, userMessage]);
    setInputValue('');
    setIsLoading(true);

    askAgent([...chat, userMessage]);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-600 to-blue-400 p-4">
      <div className="flex h-[80vh] w-full max-w-md flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-blue-500 text-white p-4 rounded-t-lg">
          <div className="flex items-center">
            <img src={botImg} className="h-8 w-8 mr-2" alt="Bot" />
            <h2 className="text-lg font-semibold">B2B Negotiator ChatBot</h2>
          </div>
        </div>
        
        {/* Chat Box */}
        <div className="flex-1 overflow-y-auto p-4" ref={chatBoxRef}>
          {chat.map((message, index) => {
            const isUser = 'user' in message.role;
            return (
              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                {!isUser && <img src={botImg} className="mr-2 h-8 w-8" alt="Bot" />}
                <div
                  className={`max-w-[75%] rounded-2xl p-3 text-sm shadow-md ${
                    isUser ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  <p>{message.content}</p>
                  <div className="text-xs text-gray-500 mt-1">{formatDate(new Date())}</div>
                </div>
                {isUser && <img src={userImg} className="ml-2 h-8 w-8" alt="User" />}
              </div>
            );
          })}
        </div>
        
        {/* Input Field */}
        <form className="flex items-center border-t p-3 bg-gray-50" onSubmit={handleSubmit}>
          <input
            type="text"
            className="flex-1 rounded-l-full border p-3 focus:outline-none"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
            disabled={isLoading}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);