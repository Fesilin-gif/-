import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/catalogData';
import { ChevronDown, HelpCircle, Search, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const filteredFaq = FAQ_ITEMS.filter(item => 
    item.q.toLowerCase().includes(search.toLowerCase()) || 
    item.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;
    setSubmitted(true);
    setUserQuestion('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-12 relative">
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Header */}
        <div className="bg-[#0F1115] text-white p-8 clip-chamfer-tr-bl shadow-2xl border border-slate-800">
          <div className="flex items-center space-x-2 text-[#FF5500] font-mono text-xs font-bold uppercase mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>// SUPPORT_CENTER // FAQ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase text-white">
            Вопросы и ответы
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl">
            Ответы на самые популярные вопросы по поводу совместимости деталей, гарантии, вариантов оплаты и доставки.
          </p>

          <div className="mt-6 relative max-w-md">
            <input
              type="text"
              placeholder="Поиск по вопросам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1A1D24] border border-slate-700 text-xs py-3 pl-9 pr-4 text-white focus:outline-none focus:border-[#FF5500] clip-button-tech"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaq.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 hover:border-[#FF5500] clip-button-tech transition-colors overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-[#0F1115] uppercase tracking-wide hover:text-[#FF5500] transition-colors"
                >
                  <span className="pr-4">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#FF5500] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ask Question Form */}
        <div className="bg-white border border-slate-200 p-6 clip-button-tech shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-[#0F1115] font-extrabold text-base uppercase">
            <MessageSquare className="w-5 h-5 text-[#FF5500]" />
            <span>Не нашли ответ на свой вопрос?</span>
          </div>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-center clip-button-tech">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
              <span>Ваш вопрос принят! Технический специалист ответит в течение 10 минут.</span>
            </div>
          ) : (
            <form onSubmit={handleQuestionSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Задайте ваш вопрос специалисту PCMarket..."
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 text-xs p-3 focus:outline-none focus:border-[#FF5500] clip-button-tech"
              />
              <button
                type="submit"
                className="py-3 px-6 bg-[#FF5500] hover:bg-[#E04B00] text-white font-mono text-xs font-bold uppercase tracking-wider clip-button-tech flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4 mr-1.5" />
                Задать вопрос
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
