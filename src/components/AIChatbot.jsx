import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';

const OPENROUTER_API_KEY = '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';
const MODEL = 'openai/gpt-4o-mini';

const SYSTEM_PROMPT = `أنت مساعد ذكي لمنصة "الباشمهندس للبرمجة وتكنولوجيا المعلومات"، منصة تعليمية متخصصة لطلاب المرحلة الثانوية المصريين.

المنصة تخدم مادتين رئيسيتين:
1. **البرمجة وعلوم الحاسب** 
2. **اللغة العربية** (النحو، الصرف، البلاغة، الأدب، الإملاء، التعبير الكتابي)

معلومات عن المنصة:
- الأسعار: اشتراك شهري 150 ج.م (8 حصص)، سنوي 350 ج.م (غير محدود)
- طرق الدفع: InstaPay، فودافون كاش، فوري، بنك مصر
- رقم الباشمهندس للتحويل: 01002169889
- بعد التحويل: الطالب يرفع صورة الإيصال من تبويب "المحفظة"
- الامتحانات: تصحيح فوري، وتقرير بالواتساب لولي الأمر

أسلوبك:
- تكلم بالعربية المصرية دايماً بأسلوب واضح ومبسط
- استخدم الإيموجي بشكل معتدل
- أجب بدقة ووضوح مع أمثلة عملية لو لزم
- لو سؤال عن البرمجة: اشرح بمثال كود لو مناسب
- لو سؤال عن العربية: اشرح القاعدة مع مثال
- لو سؤال عن المنصة: أجب بثقة بالمعلومات اللي فوق
- لو مش عارف: قول "يمكنك التواصل مع الباشمهندس مباشرة"`;

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: 'أهلاً بك يا بطل! 🤖 أنا المساعد الذكي للباشمهندس، بقدر أساعدك في:\n• **البرمجة** \n• **اللغة العربية** (النحو، البلاغة، الأدب)\n• **خدمات المنصة** (الاشتراك، الدفع، الامتحانات)\n\nاسألني أي سؤال!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    '📝 ما هو الإعراب؟',
    '💳 كيف أشحن المحفظة؟',
    '📚 ما هي البلاغة العربية؟'
  ];

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (userText) => {
    const textToProcess = (userText || input).trim();
    if (!textToProcess || isLoading) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: textToProcess };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      conversationHistory.push({ role: 'user', content: textToProcess });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://bashmohandis.com',
          'X-Title': 'Bashmohandis Education Platform'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content || 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.';

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText
      }]);
    } catch (err) {
      console.error('AI Error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '⚠️ حدث خطأ في الاتصال بالذكاء الاصطناعي. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.\n\nأو تواصل مع الباشمهندس مباشرة على 01002169889'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-40">

      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 hover:from-slate-800 hover:to-blue-800 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transform hover:scale-105 transition-all group border-2 border-amber-400/40"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
            🤖
          </div>
          <span className="text-xs font-black hidden sm:inline pl-1">اسأل مساعد الباشمهندس الذكي 💻</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[360px] sm:w-[400px] h-[520px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95">

          {/* Header */}
          <div className="bg-gradient-to-l from-slate-900 to-blue-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
                🤖
              </div>
              <div>
                <h4 className="font-black text-xs text-white">مساعد الباشمهندس الذكي</h4>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>GPT-4o · برمجة + لغة عربية ⚡</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([{
                  id: '1', sender: 'bot',
                  text: 'تم مسح المحادثة! 🔄 كيف يمكنني مساعدتك؟'
                }])}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all text-[10px] font-black"
                title="مسح المحادثة"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto bg-slate-50 text-xs">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px] flex-shrink-0 mt-0.5">
                    🤖
                  </div>
                )}
                <div className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap font-medium leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tl-none font-bold'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-tr-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">🤖</div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tr-none flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span className="text-[11px] text-slate-500 font-bold">الذكاء الاصطناعي يفكر...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[10px] font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all border border-slate-200 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="اكتب سؤالك... برمجة، عربي، أو المنصة"
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="btn-primary p-2.5 rounded-xl flex-shrink-0 disabled:opacity-50"
            >
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
