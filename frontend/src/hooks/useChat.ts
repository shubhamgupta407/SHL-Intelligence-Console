import { useState, useEffect } from 'react';
import type { Message, Recommendation, AgentResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const MAX_TURNS = 8;

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [shortlist, setShortlist] = useState<Recommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'waking' | 'ready' | 'error'>('checking');
  const [turnCount, setTurnCount] = useState(0);

  // Check health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        setHealthStatus('waking');
        const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
        if (res.ok) {
          setHealthStatus('ready');
        } else {
          setHealthStatus('error');
        }
      } catch (err) {
        setHealthStatus('error');
      }
    };
    checkHealth();
  }, []);

  const sendMessage = async (content: string) => {
    if (isEnded || isLoading || !content.trim()) return;

    const newTurnCount = turnCount + 1;
    const userMessage: Message = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error('API Error');
      }

      const data: AgentResponse = await response.json();
      
      const assistantMessage: Message = { role: 'assistant', content: data.reply };
      setMessages([...updatedMessages, assistantMessage]);
      setTurnCount(newTurnCount);

      if (data.recommendations !== null) {
        setShortlist(data.recommendations);
      }

      if (healthStatus === 'error') {
        setHealthStatus('ready');
      }

      if (data.end_of_conversation || newTurnCount >= MAX_TURNS) {
        setIsEnded(true);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'assistant', content: 'Connection lost or timeout. Please try again.' };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setShortlist(null);
    setIsEnded(false);
    setTurnCount(0);
  };

  return {
    messages,
    shortlist,
    isLoading,
    isEnded,
    turnCount,
    healthStatus,
    sendMessage,
    resetChat
  };
}
