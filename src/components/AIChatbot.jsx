import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Loader2, ArrowRightLeft, RefreshCw } from 'lucide-react';

const SYSTEM_PROMPT = `أنت "مساعد المعلم الذكي"، صديق الطالب ورفيقه في منصة منصة عِلم التعليمية واللغة العربية.
تتحدث بالعامية المصرية الطبيعية جداً وكأنك شخص حقيقي (باشمهندس برمجة ذكي ومدرس لغة عربية متمكن في نفس الوقت).
أسلوبك ودود، يشجع الطلاب، مرح، ولا يتحدث بالفصحى الجامدة إلا عند شرح قواعد اللغة العربية أو إعطاء أمثلة شعرية.

معلومات المنصة:
- الدومين الرسمي للمنصة: https://elbashmohands.dev
- الأسعار: اشتراك شهري 150 ج.م (8 حصص اختيارية)، سنوي 350 ج.م (فتح كل الحصص بلا حدود)
- طرق الدفع: InstaPay، فودافون كاش، فوري، بنك مصر
- رقم المعلم الموحد للتحويل والدعم الفني: 01002169889
- تفعيل الاشتراك: بعد التحويل، الطالب بيرفع صورة إيصال التحويل من تبويب "المحفظة" على المنصة وهيتم الموافقة فوراً.
- المواد المتاحة:
  1. البرمجة وعلوم الحاسب (Python, JavaScript, HTML/CSS, C++, Web)
  2. اللغة العربية (النحو، الصرف، البلاغة، الأدب، التعبير)

قواعد الردود:
- لو سألك عن كود برمجة: اكتب كود نظيف وبسيط مع تعليقات مبهجة بالمصري تشرح الفكرة.
- لو سألك عن النحو والبلاغة: اشرح القاعدة بطريقة مبسطة جداً مع أمثلة إعرابية سهلة.
- شجع الطالب وقوله دايماً كلمات زي: "يا بطل"، "يا هندسة"، "يا دكتورة"، "عاش جداً".
- لو الطالب سأل عن حاجة خارجة عن المواد أو المنصة، وجهه بلطف للمذاكرة والتركيز بطريقة كوميدية خفيفة.`;

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProvider] = useState('gemini'); // 'gemini' or 'openrouter'
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: 'أهلاً بيك يا بطل في منصة المعلم! 🤖 أنا المساعد الذكي بتاعك، مجهز عشان أساعدك في أي وقت في:\n\n• 💻 **البرمجة وأكواد الحاسب**\n• 📖 **النحو والبلاغة واللغة العربية**\n• 💳 **أسئلة المنصة والاشتراكات**\n\nقولي.. إيه واقف معاك ومحتاج نشرحه سوا؟'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    '💳 إزاي أشحن المحفظة وأفعل الاشتراك؟',
    '📝 اشرحلي النواسخ (كان وأخواتها)',
    '🐍 مثال على التكرار For Loop في Python',
    '🌐 إيه الفرق بين HTML و CSS؟'
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

    // Build history payload
    const historyPayload = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    // Add system prompt and current message
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...historyPayload,
      { role: 'user', content: textToProcess }
    ];

    try {
      // 1. Try secure backend proxy first
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: fullMessages,
          provider: provider
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy error status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const botText = data.response || 'عذراً، لم أتمكن من الرد حالياً.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText
      }]);

    } catch (err) {
      console.warn('Backend proxy failed or unavailable. Attempting direct browser fallback...', err);
      
      try {
        // 2. Direct browser fallback when backend server is not running (e.g. dev mode)
        if (provider === 'gemini') {
          const localGeminiKey = import.meta.env.VITE_GEMINI_API_KEY;
          if (!localGeminiKey) {
            throw new Error('Gemini local VITE_GEMINI_API_KEY is not defined.');
          }

          const chatMessages = fullMessages.filter(m => m.role !== 'system');
          const systemMessage = fullMessages.find(m => m.role === 'system');

          const contents = chatMessages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));

          const payload = {
            contents,
            generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
          };

          if (systemMessage) {
            payload.systemInstruction = {
              parts: [{ text: systemMessage.content }]
            };
          }

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${localGeminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error(`Direct Gemini call returned ${response.status}`);
          }

          const data = await response.json();
          const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، حدث خطأ في معالجة الرد.';

          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'bot',
            text: botText
          }]);

        } else {
          const localOrKey = import.meta.env.VITE_OPENROUTER_API_KEY;
          if (!localOrKey) {
            throw new Error('OpenRouter local VITE_OPENROUTER_API_KEY is not defined.');
          }
          
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localOrKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://elbashmohands.dev',
              'X-Title': 'Bashmohandis Education Platform'
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o-mini',
              messages: fullMessages,
              max_tokens: 800,
              temperature: 0.7
            })
          });

          if (!response.ok) {
            throw new Error(`Direct OpenRouter call returned ${response.status}`);
          }

          const data = await response.json();
          const botText = data.choices?.[0]?.message?.content || 'عذراً، حدث خطأ.';

          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'bot',
            text: botText
          }]);
        }

      } catch (fallbackErr) {
        console.error('All chatbot pathways failed:', fallbackErr);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: '⚠️ حصلت مشكلة بسيطة في الاتصال بالذكاء الاصطناعي. اتأكد من النت وجرب تاني، أو اسأل المعلم على طول واتساب على 01002169889.'
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProvider = () => {
    setProvider(prev => prev === 'gemini' ? 'openrouter' : 'gemini');
  };

  return (
    <div className="fixed bottom-5 left-5 z-40" dir="rtl">

      {/* Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-950 hover:bg-slate-900 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transform hover:scale-105 transition-all duration-300 border border-slate-800"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm animate-bounce">
            🤖
          </div>
          <span className="text-xs font-black hidden sm:inline pl-1">مساعد المعلم الذكي ⚡</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Premium Chat Window */}
      {isOpen && (
        <div className="bg-white w-[360px] sm:w-[420px] h-[560px] rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="bg-gradient-to-l from-slate-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
                🤖
              </div>
              <div>
                <h4 className="font-black text-xs text-white">مساعد المعلم الذكي</h4>
                <button 
                  onClick={toggleProvider}
                  className="mt-0.5 text-[9px] text-slate-300 hover:text-amber-400 font-bold flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded-md transition-all active:scale-95"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>محرك الذكاء: {provider === 'gemini' ? 'Gemini 1.5 ⚡' : 'GPT-4o Mini 🚀'}</span>
                  <ArrowRightLeft className="w-2.5 h-2.5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([{
                  id: '1', sender: 'bot',
                  text: 'تم مسح المحادثة! 🔄 إيه سؤالك الجديد يا بطل؟'
                }])}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-all text-xs"
                title="مسح المحادثة"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-slate-50 text-xs">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-6.5 h-6.5 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px] flex-shrink-0 mt-0.5 shadow-sm">
                    🤖
                  </div>
                )}
                <div className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap font-medium leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none font-bold'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6.5 h-6.5 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">🤖</div>
                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span className="text-[10px] text-slate-500 font-bold">بفكر في إجابة لردك... 🧠</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-[10px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border border-slate-200 disabled:opacity-50 active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-3.5 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="اكتب سؤالك هنا.. عربي، برمجة، أو الاشتراك"
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none disabled:opacity-50 transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-slate-950 hover:bg-slate-900 active:scale-95 text-white p-3 rounded-xl flex-shrink-0 disabled:opacity-50 transition-all shadow-md"
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
