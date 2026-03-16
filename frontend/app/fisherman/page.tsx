'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Message { id: number; sender: 'user' | 'matsya'; text: string; imageAttached?: boolean; timestamp: string; }

const INIT_MESSAGES: Message[] = [
  { id: 1, sender: 'matsya', text: 'Namaste! 🙏 I am **Matsya**, your AI fishing companion.\n\nI can help you identify fish species, check market rates, and get fishing advisories. Upload a photo of your catch and I\'ll identify it instantly!', timestamp: '09:15 AM' },
  { id: 2, sender: 'user', text: 'What fish is this? [Image attached]', imageAttached: true, timestamp: '09:16 AM' },
  { id: 3, sender: 'matsya', text: 'Based on the **dorsal fin structure** and distinctive blue-green coloration with golden lateral stripes, this is an:\n\n🐟 **Indian Mackerel** *(Rastrelliger kanagurta)*\n\n💰 **Market Rate:** ₹200/kg\n📊 **Conservation Status:** Least Concern\n\nA healthy catch! Peak season typically runs October–March. This specimen looks fresh — sell within 6 hours for best price.', timestamp: '09:16 AM' },
];

const MATSYA_RESPONSES: Record<string, string> = {
  weather: '🌀 **Current Advisory: HIGH ALERT**\nA cyclone is approaching rapidly. Wind at 45 knots. **Do NOT venture into deep sea today.** Stay within 2km of coast only.',
  market: '📈 **Today\'s Wholesale Market Rates (Mangaluru):**\n• Indian Mackerel — ₹200/kg\n• Silver Pomfret — ₹800/kg\n• Sardine — ₹80/kg\n• Yellowfin Tuna — ₹450/kg\n• Hilsa — ₹350/kg',
  default: '🤔 I can help with fish identification (upload an image), market rates, and weather advisories. What would you like to know?',
};

export default function FishermanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INIT_MESSAGES);
  const [input, setInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!user) router.replace('/login'); else if (user.role !== 'FISHERMAN' && user.role !== 'ADMIN') router.replace('/dashboard'); }, [user, router]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatOpen]);

  if (!user || (user.role !== 'FISHERMAN' && user.role !== 'ADMIN')) return null;

  const sendMessage = () => {
    if (!input.trim() && !imageUploaded) return;
    const userMsg: Message = { id: Date.now(), sender: 'user', text: input || 'What fish is this?', imageAttached: imageUploaded, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const key = input.toLowerCase().includes('weather') ? 'weather' : input.toLowerCase().includes('market') || input.toLowerCase().includes('price') ? 'market' : 'default';
    const matsyaResp: Message = {
      id: Date.now() + 1, sender: 'matsya', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: imageUploaded
        ? '🐟 **Yellow Fin Tuna** *(Thunnus albacares)*\n\n💰 **Market Rate:** ₹450/kg\n📊 **Conservation Status:** Near Threatened\n\n⚠️ Note: Subject to catch regulations — maximum 3 per vessel per day. Excellent quality specimen!'
        : MATSYA_RESPONSES[key],
    };
    setMessages(prev => [...prev, userMsg, matsyaResp]);
    setInput('');
    setImageUploaded(false);
  };

  const advisory = { level: 'RED', condition: 'Approaching Cyclone', wind: 45, tide: 2.8, sst: 29.4 };

  return (
    <div className="wave-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black gradient-text">Fisherman Portal</h1>
            <p className="text-blue-300/60 text-sm">Welcome back, {user.fullName}</p>
          </div>
          <button onClick={() => setChatOpen(true)} className="btn-primary flex items-center gap-2">
            <span className="text-lg">🐟</span> Chat with Matsya
          </button>
        </div>

        {/* Cyclone Warning Banner */}
        <div className="alert-red p-4 mb-6 flex items-center gap-4 rounded-xl">
          <span className="text-4xl">🌀</span>
          <div>
            <p className="font-black text-red-300 text-lg">⚠️ CYCLONE WARNING — DO NOT VENTURE INTO DEEP SEA</p>
            <p className="text-red-200/80 text-sm">Cyclone Tej approaching. Wind: 45 knots. Coastal regions will experience heavy rainfall. Stay ashore.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {[
            { label: 'Wind Speed', val: `${advisory.wind} knots`, icon: '💨', color: '#f87171', sub: 'Dangerous' },
            { label: 'Tide Level', val: `${advisory.tide} m`, icon: '🌊', color: '#fbbf24', sub: 'High Tide' },
            { label: 'Sea Surface Temp', val: `${advisory.sst}°C`, icon: '🌡️', color: '#fb923c', sub: 'Above normal' },
          ].map(w => (
            <div key={w.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{w.icon}</span>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: w.color, background: `${w.color}20`, border: `1px solid ${w.color}40` }}>{w.sub}</span>
              </div>
              <p className="text-2xl font-black text-white">{w.val}</p>
              <p className="text-sm text-blue-300/60">{w.label}</p>
            </div>
          ))}
        </div>

        {/* 5-Day Forecast */}
        <div className="glass-card p-5 mb-6">
          <h2 className="font-bold text-white mb-4 text-lg">5-Day Fishing Forecast</h2>
          <div className="grid grid-cols-5 gap-2">
            {[
              { day: 'Today', icon: '🌀', wind: 45, wave: 4.2, advisory: 'Red' },
              { day: 'Tue', icon: '🌧️', wind: 30, wave: 2.8, advisory: 'Orange' },
              { day: 'Wed', icon: '⛅', wind: 18, wave: 1.5, advisory: 'Yellow' },
              { day: 'Thu', icon: '🌤️', wind: 12, wave: 0.8, advisory: 'Green' },
              { day: 'Fri', icon: '☀️', wind: 8, wave: 0.5, advisory: 'Green' },
            ].map(f => {
              const colors: Record<string, string> = { Red: '#f87171', Orange: '#fb923c', Yellow: '#fbbf24', Green: '#4ade80' };
              return (
                <div key={f.day} className="text-center p-3 rounded-xl" style={{ background: `${colors[f.advisory]}10`, border: `1px solid ${colors[f.advisory]}30` }}>
                  <p className="text-xs text-blue-300/60 mb-1">{f.day}</p>
                  <p className="text-2xl mb-1">{f.icon}</p>
                  <p className="text-xs font-bold text-white">{f.wind}kt</p>
                  <p className="text-xs" style={{ color: colors[f.advisory] }}>{f.advisory}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Catch Insights */}
        <div className="glass-card p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2 text-lg"><span>🎣</span> AI Catch Probability</h2>
          {[
            { species: 'Indian Mackerel', chance: 10, note: 'Sea too rough today' },
            { species: 'Sardine', chance: 8, note: 'Displaced by storm' },
            { species: 'Yellow Fin Tuna', chance: 5, note: 'Deep water — avoid' },
          ].map(c => (
            <div key={c.species} className="flex items-center gap-4 mb-3">
              <span className="w-36 text-sm text-blue-200/80 flex-shrink-0">{c.species}</span>
              <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(61,214,195,0.1)' }}>
                <div className="h-full rounded-full" style={{ width: `${c.chance}%`, background: 'linear-gradient(90deg, #f87171, #fbbf24)' }} />
              </div>
              <span className="text-xs font-bold text-red-400 w-8">{c.chance}%</span>
              <span className="text-xs text-blue-300/50 hidden md:block">{c.note}</span>
            </div>
          ))}
          <p className="text-xs text-red-400/80 mt-3">⚠️ Overall recommendation: Stay ashore until Cyclone Tej passes.</p>
        </div>
      </div>

      {/* Matsya Chat Window */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:justify-end p-4 md:p-8" style={{ background: 'rgba(2,13,26,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card-dark w-full max-w-md flex flex-col" style={{ height: '70vh', maxHeight: '600px' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(61,214,195,0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl float-anim" style={{ background: 'linear-gradient(135deg, #0f7c7c, #3dd6c3)' }}>🐟</div>
                <div>
                  <p className="font-bold text-white">Matsya</p>
                  <p className="text-xs" style={{ color: '#3dd6c3' }}>● Online · AI Fish Identifier</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-blue-300/60 hover:text-white text-xl transition-colors">✕</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
              {messages.map(m => (
                <div key={m.id} className={m.sender === 'user' ? 'chat-user self-end' : 'chat-matsya self-start'}>
                  {m.imageAttached && (
                    <div className="mb-2 p-2 rounded-lg text-xs flex items-center gap-2" style={{ background: 'rgba(61,214,195,0.1)', border: '1px dashed rgba(61,214,195,0.3)' }}>
                      <span>📷</span> <span style={{ color: '#7ee8d8' }}>fish_photo.jpg</span>
                    </div>
                  )}
                  <p className="text-sm text-blue-100 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#7ee8d8">$1</strong>') }} />
                  <p className="text-xs mt-1 opacity-40">{m.timestamp}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Image upload bar */}
            <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={() => setImageUploaded(true)} />
            {imageUploaded && (
              <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'rgba(61,214,195,0.08)', borderTop: '1px solid rgba(61,214,195,0.1)' }}>
                <span className="text-xs" style={{ color: '#3dd6c3' }}>📷 Image attached</span>
                <button onClick={() => setImageUploaded(false)} className="text-xs text-red-400 ml-auto">Remove</button>
              </div>
            )}

            {/* Input */}
            <div className="p-3 flex gap-2" style={{ borderTop: '1px solid rgba(61,214,195,0.15)' }}>
              <button onClick={() => fileRef.current?.click()} className="p-2.5 rounded-lg transition-colors" style={{ background: 'rgba(61,214,195,0.1)', color: '#3dd6c3', border: '1px solid rgba(61,214,195,0.2)' }} title="Upload fish photo">
                📷
              </button>
              <input className="ocean-input flex-1 py-2 text-sm" placeholder="Ask Matsya anything..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
              <button onClick={sendMessage} className="btn-primary px-3 py-2 text-sm">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
