import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, User, Bot, Loader2, HelpCircle } from 'lucide-react';
import { FoodAnalysisResult } from '../types/food';

interface AskFoodChatProps {
  food: FoodAnalysisResult;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const AskFoodChat: React.FC<AskFoodChatProps> = ({ food }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested starter questions based on this food
  const starterQuestions = [
    `How does this food impact blood sugar and insulin?`,
    `Is this suitable for children or pregnant women?`,
    `Can I consume this every day without health risks?`,
    `What are the most concerning additives in this product?`,
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    setInputQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodData: food,
          question: q,
          chatHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, I encountered an issue retrieving the answer. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Ask LabelLens AI</h3>
          <p className="text-xs text-slate-400">
            Ask any follow-up question specifically about {food.productName}
          </p>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="min-h-[160px] max-h-[360px] overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 text-center space-y-3">
            <Sparkles className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Have specific questions about glycemic index, digestion, sports nutrition, or additives?
              Click a question below or type your own.
            </p>

            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {starterQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-emerald-300 text-xs font-medium border border-slate-700/60 hover:border-emerald-500/30 transition text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-medium'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 text-slate-200 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>LabelLens AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputQuery);
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask anything about ${food.productName}...`}
          disabled={isLoading}
          className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
