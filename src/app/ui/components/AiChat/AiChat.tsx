'use client';

import React, { useEffect, useRef, useState } from 'react';

import { useAiChat } from './hooks/useAiChat';

const EXAMPLE_QUERIES = [
  '205/55/16 Michelin',
  'used tires under $80',
  'llantas usadas menos de 150 mil',
  'nuevas aro 17',
  'Bridgestone new 195/65/15',
  'usadas con más de 50% de vida',
];

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, clearChat } = useAiChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue('');
    void sendMessage(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  // Stop both click AND touch propagation so the backdrop never
  // receives events that originate inside the panel.
  const stopProp = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <>
      {/* Backdrop — only onClick needed; touch is blocked by the panel */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed z-50 flex flex-col rounded-xl shadow-2xl border border-gray-200 bg-white overflow-hidden"
          style={{
            bottom: '5rem',
            left: '0.5rem',
            right: '0.5rem',
            height: '520px',
            maxWidth: '420px',
            marginLeft: 'auto',
          }}
          onClick={stopProp}
          onTouchStart={stopProp}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-green-600 text-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <div>
                <p className="font-semibold text-sm">AI Inventory Assistant</p>
                <p className="text-xs text-green-100">Spanish or English</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="p-1.5 rounded-lg hover:bg-green-700 transition-colors text-xs text-green-100 hover:text-white"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-green-700 transition-colors"
                aria-label="Close chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <span className="text-4xl">✨</span>
                <p className="font-medium text-gray-600 text-sm">Try one of these:</p>
                <div className="space-y-1.5 w-full">
                  {EXAMPLE_QUERIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setInputValue(q)}
                      className="block w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-green-600 hover:text-green-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.isFilterApplication ? (
                  <div className="max-w-[85%] px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-green-600 text-xs font-medium">✓ Filters applied</span>
                    </div>
                    {msg.content}
                  </div>
                ) : msg.role === 'user' ? (
                  <div className="max-w-[85%] px-3 py-2 rounded-xl bg-green-600 text-white text-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[85%] px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-xl bg-white border border-gray-200">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input — native form submit is the most reliable on iOS */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 shrink-0 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              enterKeyHint="send"
              placeholder="Ask about tires..."
              disabled={isLoading}
              style={{ fontSize: '16px' }}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              aria-label="Send"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-600 hover:bg-green-700'
        }`}
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">✨</span>
        )}
      </button>
    </>
  );
}
