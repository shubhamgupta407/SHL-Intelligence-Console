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

  return (
    <div className={styles.container}>
      <div className={styles.scrollArea} ref={scrollRef} aria-live="polite">
        
        {messages.length === 0 && (
          <div className={styles.welcomeState}>
            <h1 className={styles.welcomeTitle}>SHL Intelligence Console</h1>
            <p className={styles.welcomeText}>
              Describe your hiring requirements to receive a grounded, 
              verified shortlist of SHL assessments. This tool operates 
              strictly against the real catalog to ensure provenance.
            </p>
            <button 
              className={styles.examplePrompt}
              onClick={() => {
                setInputValue("I'm hiring a mid-level Java developer who works with stakeholders.");
              }}
            >
              "I'm hiring a mid-level Java developer who works with stakeholders."
            </button>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`${styles.message} ${msg.role === 'user' ? styles.userTurn : styles.assistantTurn}`}
          >
            <div className={styles.messageContent}>{msg.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className={styles.typingSkeleton}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        {isEnded ? (
          <div className={styles.endState}>
            {turnCount >= 8 ? 'Turn limit reached. ' : 'Conversation finalized. '}
            <button className={styles.resetBtn} onClick={resetChat}>
              Start new search
            </button>
          </div>
        ) : (
          <form className={styles.inputForm} onSubmit={handleSubmit}>
            <input
              className={styles.inputField}
              type="text"
              placeholder="Describe your hiring needs..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isLoading || isEnded}
            />
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={!inputValue.trim() || isLoading || isEnded}
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
