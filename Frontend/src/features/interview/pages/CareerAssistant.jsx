import React, { useState, useEffect, useRef } from 'react';
import '../style/assistant.scss';
import { chatWithAssistant } from '../services/interview.api.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useNavigate } from 'react-router';

/**
 * @description AI Career Assistant chat page.
 * Provides a conversational interface where the user can send messages
 * and receive AI-generated responses. The UI features a scrolling chat
 * history, message bubbles, and a modern dark‑mode aesthetic.
 */
const CareerAssistant = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    try {
      const response = await chatWithAssistant({ messages: newHistory });
      if (response && response.reply) {
        const aiMsg = { role: 'assistant', content: response.reply };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Assistant chat error:', err);
      // Show fallback error message
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="assistant-page">
      <header className="assistant-header">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff2d78" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Interview<span className="logo-ai">.AI</span></span>
        </div>
        <div className="assistant-actions">
          <button className="assistant-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          <button className="assistant-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="assistant-chat">
        <div className="chat-history">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role === 'assistant' ? 'assistant' : 'user'}`}>
              <p>{msg.content}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a career question…"
            rows={1}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="send-btn">
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default CareerAssistant;
