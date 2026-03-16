import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function DiinAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'আসসালামু আলাইকুম! আমি Diin AI - আপনার ব্যক্তিগত ইসলামিক সহায়ক। ইসলামের যেকোনো বিষয়ে প্রশ্ন করুন, আমি কুরআন ও হাদিসের আলোকে উত্তর দেব।',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
      });
      const data = await response.json();

      const botMessage: Message = {
        id: messages.length + 2,
        text: data.response || 'দুঃখিত, আমি উত্তর দিতে পারছি না।',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: messages.length + 2,
        text: 'দুঃখিত, নেটওয়ার্ক সমস্যা হচ্ছে।',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto h-screen p-4">
      {/* Header */}
      <div className="bg-emerald-700 text-white p-4 rounded-t-lg flex items-center gap-3 shadow-md">
        <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-full text-2xl">🕋</div>
        <div>
          <h1 className="text-xl font-bold">Diin AI - ইসলামিক সহায়ক</h1>
          <p className="text-sm text-emerald-200">learn islam</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-emerald-50/50 flex flex-col gap-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-xl shadow ${
              msg.sender === 'user'
                ? 'bg-emerald-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none border border-emerald-200'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-emerald-100' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-emerald-200 shadow">
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-200"></div>
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-400"></div>
              <span className="text-xs text-gray-500 ml-2">AI উত্তর লিখছে...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-4 bg-white border-t border-emerald-200 rounded-b-lg">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="আপনার প্রশ্ন লিখুন... (যেকোনো ইসলামিক বিষয়ে)"
          className="flex-1 px-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isLoading}
          className={`px-5 py-3 rounded-lg font-medium transition-colors ${
            !inputText.trim() || isLoading
              ? 'bg-emerald-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isLoading ? '...' : 'পাঠান'}
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-2">⚡ learn islam</div>
    </div>
  );
}