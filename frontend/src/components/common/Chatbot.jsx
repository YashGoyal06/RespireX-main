import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const Chatbot = ({ language = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      text: language === 'hi' 
        ? "नमस्ते! मैं RespireX AI असिस्टेंट हूँ। मैं आपकी कैसे मदद कर सकता हूँ?" 
        : "Hi! I'm RespireX AI. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Knowledge Base (Simple Rule-Based AI)
  const getBotResponse = (query) => {
    const q = query.toLowerCase();
    const isHindi = language === 'hi';

    if (q.includes('tb') || q.includes('symptom') || q.includes('लक्षण')) {
      return isHindi 
        ? "टीबी के सामान्य लक्षणों में 3 सप्ताह से अधिक खांसी, बुखार, वजन कम होना और रात में पसीना आना शामिल हैं। क्या आप अभी टेस्ट करना चाहते हैं?"
        : "Common TB symptoms include cough >3 weeks, fever, weight loss, and night sweats. Would you like to take the screening test?";
    }
    if (q.includes('book') || q.includes('appoint') || q.includes('doctor') || q.includes('बुकिंग') || q.includes('डॉक्टर')) {
      return isHindi
        ? "आप डैशबोर्ड पर 'अपॉइंटमेंट बुक करें' बटन पर क्लिक करके डॉक्टर से परामर्श ले सकते हैं।"
        : "You can schedule a consultation by clicking the 'Book Appointment' button on your dashboard.";
    }
    if (q.includes('cost') || q.includes('price') || q.includes('money') || q.includes('fee') || q.includes('पैसे')) {
      return isHindi
        ? "RespireX की प्रारंभिक एआई स्क्रीनिंग पूरी तरह से मुफ्त है! डॉक्टर का परामर्श शुल्क अलग हो सकता है।"
        : "The RespireX AI screening is completely free! Doctor consultation fees may vary.";
    }
    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('नमस्ते')) {
      return isHindi ? "नमस्ते! पूछिए क्या जानना चाहते हैं?" : "Hello! What can I do for you?";
    }
    
    return isHindi 
      ? "माफ़ कीजिये, मैं अभी सीख रहा हूँ। कृपया टीबी, लक्षणों या अपॉइंटमेंट के बारे में पूछें।"
      : "I'm still learning. Please ask about TB, symptoms, or appointments.";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add User Message
    const newMessages = [...messages, { type: 'user', text: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate Bot Typing
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: getBotResponse(input) }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale flex flex-col h-[450px]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6" />
              <span className="font-bold">RespireX Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-700 dark:text-gray-200 text-gray-800 border border-gray-200 dark:border-gray-600 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'hi' ? "यहाँ टाइप करें..." : "Type a question..."}
              className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition flex items-center justify-center hover:scale-110 active:scale-95"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
      </button>
    </div>
  );
};

export default Chatbot;
