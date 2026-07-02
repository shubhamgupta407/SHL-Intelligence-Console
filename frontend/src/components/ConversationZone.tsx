import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import styles from './ConversationZone.module.css';

interface Props {
  messages: Message[];
  isLoading: boolean;
  isEnded: boolean;
  turnCount: number;
  sendMessage: (msg: string) => void;
  resetChat: () => void;
}

export const ConversationZone: React.FC<Props> = ({
  messages,
  isLoading,
  isEnded,
  turnCount,
  sendMessage,
  resetChat
}) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !isEnded) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const starterCards = [
    { title: "Senior Leadership", text: "Evaluate CXOs and Directors" },
    { title: "Graduate Hiring", text: "Assess volume early careers" },
    { title: "Tech & Dev", text: "Test coding and system design" },
    { title: "Sales Potential", text: "Identify top performers" }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.scrollArea} ref={scrollRef}>
        
        {messages.length === 0 && (
          <div className={styles.welcomeState}>
            <div className={styles.welcomeHeader}>
              <h1 className={styles.welcomeTitle}>How can I help you assess talent today?</h1>
            </div>
            
            <div className={styles.starterGrid}>
              {starterCards.map((card, idx) => (
                <button 
                  key={idx}
                  className={styles.starterCard}
                  onClick={() => setInputValue(`I'm hiring for a ${card.title.toLowerCase()} role. ${card.text}.`)}
                >
                  <div className={styles.cardTitle}>{card.title}</div>
                  <div className={styles.cardText}>{card.text}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.messageList}>
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.user : styles.agent}`}
            >
              <div className={styles.avatar}>
                {msg.role === 'user' ? 'U' : 'AI'}
              </div>
              <div className={styles.messageContent}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.messageWrapper} ${styles.agent}`}>
              <div className={styles.avatar}>AI</div>
              <div className={styles.typingIndicator}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputConstraint}>
          {isEnded ? (
            <div className={styles.endState}>
              <span className={styles.endText}>
                {turnCount >= 8 ? 'Turn limit reached.' : 'Conversation finalized.'}
              </span>
              <button className={styles.resetBtn} onClick={resetChat}>
                Start New Search
              </button>
            </div>
          ) : (
            <form className={styles.inputForm} onSubmit={handleSubmit}>
              <input
                className={styles.inputField}
                type="text"
                placeholder="Message SHL Intelligence..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isLoading || isEnded}
                autoFocus
              />
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={!inputValue.trim() || isLoading || isEnded}
                aria-label="Send Message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          )}
          <div className={styles.inputFooter}>
            <span>SHL Intelligence can make mistakes. Verify critical assessments.</span>
            {turnCount > 0 && (
              <span style={{ float: 'right', opacity: 0.6 }}>
                Turn {turnCount} of 8
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
