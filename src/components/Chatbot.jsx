import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

// Replace with your Gemini API endpoint and key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = 'AIzaSyCqa9lQdRsCcJrGduoWKSTtGFyH5X2YqaE';

const Chatbot = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your CookIQ assistant! 👨‍🍳 I can help you with recipes, cooking tips, ingredient substitutions, and more. What would you like to cook today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const quickActions = [
    { text: "Recipe suggestions", icon: "🍳" },
    { text: "Ingredient substitutes", icon: "🔄" },
    { text: "Cooking techniques", icon: "👨‍🍳" },
    { text: "Meal planning", icon: "📅" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gemini API integration
  const fetchGeminiResponse = async (userMessage) => {
    try {
      const res = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: userMessage }] }
          ]
        })
      });
      if (!res.ok) {
        return `Gemini API error: ${res.status} ${res.statusText}`;
      }
      const data = await res.json();
      return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't get a response from Gemini."
      );
    } catch (err) {
      return "Sorry, there was an error connecting to Gemini API.";
    }
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Get Gemini API response
    const botReply = await fetchGeminiResponse(messageText);

    const botResponse = {
      id: Date.now() + 1,
      type: 'bot',
      content: botReply,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chatbot Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-avatar">👨‍🍳</div>
          <div className="chatbot-info">
            <h3>CookIQ Assistant</h3>
            <span className="status">Online</span>
          </div>
          <button className="chatbot-minimize" onClick={onToggle}>
            −
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot typing">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action"
              onClick={() => handleSendMessage(action.text)}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-text">{action.text}</span>
            </button>
          ))}
        </div>

        <div className="chatbot-input">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about cooking..."
            rows="1"
            className="message-input"
          />
          <button 
            className="send-button"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim()}
          >
            <span className="send-icon">➤</span>
          </button>
          <button
            className="voice-button"
            style={{ marginLeft: 8 }}
            onClick={startListening}
            disabled={isListening}
            title="Speak your question"
          >
            {isListening ? '🎤 Listening...' : '🎤'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;