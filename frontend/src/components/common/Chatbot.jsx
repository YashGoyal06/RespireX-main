import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

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

  // Expanded Knowledge Base
  const getBotResponse = (query) => {
    const q = query.toLowerCase();
    const isHindi = language === 'hi';

    // 1. Symptoms & General TB info
    if (q.includes('tb') || q.includes('symptom') || q.includes('लक्षण') || q.includes('tuberculosis')) {
      return isHindi 
        ? "टीबी के सामान्य लक्षणों में 3 सप्ताह से अधिक खांसी, बुखार, वजन कम होना, सीने में दर्द और रात में पसीना आना शामिल हैं। क्या आप अभी टेस्ट करना चाहते हैं?"
        : "Common TB symptoms include cough lasting >3 weeks, fever, unexplained weight loss, chest pain, and night sweats. Would you like to take the screening test?";
    }
    
    // 2. Booking & Appointments
    if (q.includes('book') || q.includes('appoint') || q.includes('doctor') || q.includes('बुकिंग') || q.includes('डॉक्टर') || q.includes('consult')) {
      return isHindi
        ? "आप डैशबोर्ड पर 'अपॉइंटमेंट बुक करें' (Book Appointment) बटन पर क्लिक करके प्रमाणित डॉक्टर से परामर्श ले सकते हैं।"
        : "If you need a consultation, you can schedule one by clicking the 'Book Appointment' button on your dashboard.";
    }
    
    // 3. Cost & Fees
    if (q.includes('cost') || q.includes('price') || q.includes('money') || q.includes('fee') || q.includes('पैसे') || q.includes('free') || q.includes('मुफ्त')) {
      return isHindi
        ? "RespireX की प्रारंभिक एआई स्क्रीनिंग पूरी तरह से मुफ्त है! हालांकि, डॉक्टर का परामर्श शुल्क डॉक्टर के अनुसार अलग हो सकता है।"
        : "The RespireX AI screening is completely free! However, if you book a consultation, the doctor's fees may vary.";
    }

    // 4. Prevention & Contagion
    if (q.includes('prevent') || q.includes('spread') || q.includes('contagious') || q.includes('बचाव') || q.includes('फैलता')) {
      return isHindi
        ? "टीबी हवा के माध्यम से फैलता है। बचाव के लिए: खांसते समय मुंह ढकें, अच्छी हवादार जगहों पर रहें, और यदि किसी संक्रमित व्यक्ति के संपर्क में आए हैं तो तुरंत टेस्ट कराएं।"
        : "TB spreads through the air. To prevent it: cover your mouth when coughing, ensure good ventilation, and get screened immediately if you've been in contact with an infected person.";
    }

    // 5. Accuracy & AI Reliability
    if (q.includes('accurate') || q.includes('trust') || q.includes('reliable') || q.includes('सटीक') || q.includes('भरोसा')) {
      return isHindi
        ? "हमारा एआई मॉडल 98% तक सटीकता के साथ प्रशिक्षित है। हालांकि, यह एक प्रारंभिक स्क्रीनिंग है। सकारात्मक परिणाम आने पर हमेशा डॉक्टर से पुष्टि करें।"
        : "Our AI model is highly accurate (up to 98% precision). However, this is a preliminary screening tool. Always verify a 'Positive' result with a certified doctor.";
    }

    // 6. X-ray Guidelines
    if (q.includes('xray') || q.includes('x-ray') || q.includes('upload') || q.includes('एक्स-रे') || q.includes('फोटो')) {
      return isHindi
        ? "कृपया अपनी छाती के एक्स-रे की स्पष्ट, अच्छी रोशनी वाली तस्वीर अपलोड करें। फाइल 10MB से छोटी और JPG/PNG फॉर्मेट में होनी चाहिए।"
        : "Please ensure you upload a clear, well-lit image of your full chest X-ray. The file must be under 10MB in JPG or PNG format.";
    }

    // 7. Privacy & Data Security
    if (q.includes('privacy') || q.includes('secure') || q.includes('data') || q.includes('सुरक्षा') || q.includes('डेटा')) {
      return isHindi
        ? "आपका डेटा पूरी तरह से सुरक्षित है। हम सैन्य-ग्रेड एन्क्रिप्शन का उपयोग करते हैं और आपकी मेडिकल रिपोर्ट ब्लॉकचेन तकनीक द्वारा सुरक्षित हैं।"
        : "Your health data is completely secure. We use military-grade encryption, and your test records are secured using Blockchain hashing for immutability.";
    }

    // 8. Test History & Reports
    if (q.includes('history') || q.includes('report') || q.includes('download') || q.includes('इतिहास') || q.includes('रिपोर्ट') || q.includes('पीडीएफ')) {
      return isHindi
        ? "आप अपने 'टेस्ट इतिहास' (Test History) अनुभाग से अपने पिछले सभी परिणाम देख सकते हैं और अपनी मेडिकल रिपोर्ट पीडीएफ में डाउनलोड कर सकते हैं।"
        : "You can view all your past results and download your medical reports as PDFs from the 'Test History' section on your dashboard.";
    }

    // 9. Emergency / Urgent Care
    if (q.includes('blood') || q.includes('emergency') || q.includes('खून') || q.includes('आपातकाल') || q.includes('breath') || q.includes('सांस')) {
      return isHindi
        ? "⚠ चेतावनी: यदि आपको खांसी में खून आ रहा है या सांस लेने में गंभीर कठिनाई हो रही है, तो कृपया ऐप का उपयोग न करें और तुरंत निकटतम अस्पताल जाएं!"
        : "⚠ URGENT: If you are coughing up blood or experiencing severe shortness of breath, please stop using the app and visit the nearest emergency room immediately!";
    }

    // 10. Greetings
    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('नमस्ते') || q.includes('help')) {
      return isHindi ? "नमस्ते! मैं टीबी के लक्षणों, एक्स-रे अपलोड, या अपॉइंटमेंट बुकिंग के बारे में आपकी मदद कर सकता हूँ। पूछिए!" : "Hello! I can help you with TB symptoms, X-ray uploads, or booking appointments. Ask away!";
    }
    
    // Default Fallback
    return isHindi 
      ? "माफ़ कीजिये, मैं अभी सीख रहा हूँ। कृपया टीबी के लक्षणों, एक्स-रे, रिपोर्ट, या अपॉइंटमेंट के बारे में कुछ सरल शब्दों में पूछें।"
      : "I'm still learning. Please try asking about TB symptoms, uploading X-rays, privacy, or booking an appointment in simple terms.";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { type: 'user', text: input }];
    setMessages(newMessages);
    setInput("");

    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: getBotResponse(input) }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale flex flex-col h-[450px]">
          
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6" />
              <span className="font-bold">RespireX Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                    : 'bg-white dark:bg-gray-700 dark:text-gray-200 text-gray-800 border border-gray-200 dark:border-gray-600 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'hi' ? "यहाँ टाइप करें..." : "Ask a question..."}
              className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition flex items-center justify-center hover:scale-110 active:scale-95"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </button>
    </div>
  );
};

export default Chatbot;
