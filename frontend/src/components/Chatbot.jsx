import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

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
  const messagesEndRef = useRef(null);

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

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('recipe') || lowerMessage.includes('cook')) {
      return "I'd love to help you find a recipe! What ingredients do you have available? Or are you looking for a specific type of cuisine? 🍽️";
    } else if (lowerMessage.includes('substitute') || lowerMessage.includes('replace')) {
      return "Great question about substitutions! What ingredient are you looking to substitute? I can suggest alternatives based on what you're cooking. 🔄";
    } else if (lowerMessage.includes('time') || lowerMessage.includes('how long')) {
      return "Cooking times can vary! What dish are you preparing? I can give you specific timing guidelines and tips to know when it's perfectly done. ⏰";
    } else if (lowerMessage.includes('healthy') || lowerMessage.includes('nutrition')) {
      return "I love helping with healthy cooking! Are you looking for low-calorie options, high-protein meals, or specific dietary requirements? 🥗";
    } else if (lowerMessage.includes('beginner') || lowerMessage.includes('easy')) {
      return "Perfect! I have lots of beginner-friendly recipes. Would you prefer something that takes under 30 minutes, or are you interested in learning basic cooking techniques? 👶‍🍳";
    } else if (lowerMessage.includes('spicy') || lowerMessage.includes('hot')) {
      return "Spicy food lover! 🌶️ What's your heat tolerance level? I can suggest recipes from mild to extremely hot, and share tips on how to balance spice levels.";
    } else if (lowerMessage.includes('dessert') || lowerMessage.includes('sweet')) {
      return "Sweet treats coming up! 🍰 Are you in the mood for something chocolatey, fruity, or maybe a classic comfort dessert? I can also suggest no-bake options!";
    } else if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
      return "Excellent choice for plant-based cooking! 🌱 Are you looking for protein-rich meals, comfort food alternatives, or maybe some creative veggie dishes?";
    } else if (lowerMessage.includes('quick') || lowerMessage.includes('fast')) {
      return "Need something quick? ⚡ I can suggest 15-minute meals, one-pot dishes, or prep-ahead options. What type of meal are you thinking?";
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're very welcome! I'm always here to help make your cooking adventures more delicious and fun! 😊 Anything else you'd like to know?";
    } else {
      return "That's interesting! I'm here to help with all things cooking. Feel free to ask me about recipes, ingredients, techniques, or any cooking challenges you're facing! 👨‍🍳✨";
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

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateBotResponse(messageText),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
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
        </div>
      </div>
    </>
  );
};

export default Chatbot;