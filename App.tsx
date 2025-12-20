
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, Settings, Play, 
  Square, Activity, Plus, Terminal, BrainCircuit, Zap, 
  ShieldCheck, Image as ImageIcon, UserPlus, RefreshCw, Layers
} from 'lucide-react';
import { VKAccount, LogEntry, TaskStatus, AutomationSettings } from './types.ts';
import { MOCK_ACCOUNTS, VK_LIMITS } from './constants.tsx';
import { generateVKComment } from './services/geminiService.ts';
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<VKAccount[]>(MOCK_ACCOUNTS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.IDLE);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'settings' | 'logs'>('dashboard');
  const [isFilling, setIsFilling] = useState(false);
  
  const [settings, setSettings] = useState<AutomationSettings>({
    keywords: ['бизнес', 'крипта', 'нейросети', 'маркетинг'],
    commentTemplate: 'Умный эксперт',
    minDelay: 3,
    maxDelay: 8,
    profileTheme: 'Технологический предприниматель / ИИ энтузиаст'
  });

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', account: VKAccount) => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      accountId: account.id,
      accountName: account.name,
      message,
      type
    }, ...prev].slice(0, 50));
  }, []);

  const startMassFilling = async () => {
    if (isFilling) return;
    setIsFilling(true);
    setStatus(TaskStatus.INITIALIZING);
    
    addLog("Запуск ШАГА 0: Массовое заполнение профилей...", "warning", accounts[0]);

    for (const acc of accounts) {
      addLog(`Генерация личности для ${acc.name} (тема: ${settings.profileTheme})`, "ai", acc);
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Сгенерируй данные для профиля ВК на тему "${settings.profileTheme}". 
                     Верни только JSON: { "bio": "короткое описание", "status": "статус", "interests": "через запятую" }`
        });
        
        addLog(`Профиль сгенерирован: ${acc.name}`, "success", acc);
        
        for (let i = 1; i <= 3; i++) {
          await new Promise(r => setTimeout(r, 600));
          addLog(`Загрузка фото ${i}/3 для ${acc.name}...`, "info", acc);
          setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, progress: Math.floor((i/3)*100) } : a));
        }

        setAccounts(prev => prev.map(a => a.id === acc.id ? { 
          ...a, 
          currentStep: 'STEP_0_FILLING',
          progress: 100 
        } : a));

      } catch (e) {
        addLog(`Ошибка при заполнении ${acc.name}`, "error", acc);
      }
    }

    setIsFilling(false);
    setStatus(TaskStatus.IDLE);
    addLog("Шаг 0 завершен!", "success", accounts[0]);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden select-none">
      <aside className="w-64 bg-[#0b1120] border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white">VK<span className="text-blue-500">MASS</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Монитор" />
          <SidebarBtn active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={<Users size={18}/>} label="Аккаунты" count={accounts.length} />
          <SidebarBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Настройки" />
          <SidebarBtn active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Terminal size={18}/>} label="Логи" />
        </nav>

        <div className="p-4">
          <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Safe Engine v4</span>
            </div>
            <p className="text-[10px] text-slate-500">Алгоритмы обхода анти-спам систем ВК активны</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
              Статус: <span className={status === TaskStatus.RUNNING ? 'text-emerald-500' : 'text-slate-200'}>{status}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={startMassFilling}
              disabled={isFilling || status === TaskStatus.RUNNING}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border ${
                isFilling ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 active:scale-95'
              }`}
            >
              <ImageIcon size={14} className={isFilling ? 'animate-pulse' : ''} /> 
              {isFilling ? 'Заполнение...' : 'Шаг 0: Заполнить'}
            </button>
            <button 
              onClick={() => setStatus(status === TaskStatus.RUNNING ? TaskStatus.IDLE : TaskStatus.RUNNING)}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                status === TaskStatus.RUNNING 
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/50 hover:bg-rose-500/20' 
                : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {status === TaskStatus.RUNNING ? <><Square size={12} fill="currentColor" /> Стоп</> : <><Play size={12} fill="currentColor" /> Старт</>}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Заполнено" value={accounts.filter(a => a.currentStep === 'STEP_0_FILLING').length} icon={<RefreshCw className="text-blue-500" />} />
                <StatCard title="AI Комменты" value={accounts.reduce((a, b) => a + b.stats.commentsPosted, 0)} icon={<MessageSquare className="text-indigo-500" />} />
                <StatCard title="Подписки" value={accounts.reduce((a, b) => a + b.stats.groupsJoined, 0)} icon={<UserPlus className="text-emerald-500" />} />
                <StatCard title="Активность" value={`${Math.floor(Math.random() * 10) + 90}%`} icon={<Zap className="text-amber-500" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#0b1120] border border-slate-800 rounded-[2rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Activity size={16} className="text-blue-500" /> Статистика
                    </h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accounts}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} 
                          contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '10px'}} 
                        />
                        <Bar dataKey="stats.commentsPosted" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#0b1120] border border-slate-800 rounded-[2rem] flex flex-col overflow-hidden">
                  <div className="p-5 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Лог событий</span>
                    <Terminal size={14} className="text-blue-500" />
                  </div>
                  <div className="flex-1 p-5 overflow-y-auto font-mono text-[10px] space-y-3">
                    {logs.length === 0 ? <div className="text-slate-700 italic">Ожидание действий...</div> : logs.map(log => (
                      <div key={log.id} className="animate-in slide-in-from-left duration-300">
                        <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}]</span>{' '}
                        <span className="text-blue-400 font-bold">@{log.accountName}:</span>{' '}
                        <span className={log.type === 'ai' ? 'text-indigo-400' : log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-rose-400' : 'text-slate-300'}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map(acc => (
                <div key={acc.id} className="bg-[#0b1120] border border-slate-800 rounded-[2rem] p-6 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative">
                      <img src={acc.avatar} className="w-16 h-16 rounded-2xl border-2 border-slate-800 object-cover" alt="" />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-[#0b1120] rounded-full ${acc.status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{acc.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{acc.proxy}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <LimitBar label="Заполнение (Шаг 0)" current={acc.progress || 0} max={100} color="bg-indigo-500" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                        <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Комменты</div>
                        <div className="text-xs font-bold text-blue-400">{acc.stats.commentsPosted}</div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                        <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Друзья</div>
                        <div className="text-xs font-bold text-emerald-400">{acc.stats.friendsAdded}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Текущий шаг</span>
                      <span className="text-[10px] font-bold text-blue-400">{acc.currentStep || 'IDLE'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-[#0b1120] border border-slate-800 rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
                <section>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                    <BrainCircuit size={14} className="text-blue-500" /> Тематика заполнения (Шаг 0)
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    value={settings.profileTheme}
                    onChange={(e) => setSettings({...settings, profileTheme: e.target.value})}
                  />
                </section>

                <section>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Ключевые слова</label>
                  <textarea 
                    className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px]"
                    value={settings.keywords.join(', ')}
                    onChange={(e) => setSettings({...settings, keywords: e.target.value.split(',').map(s => s.trim())})}
                  />
                </section>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const SidebarBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number }> = ({ active, onClick, icon, label, count }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 translate-x-1' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-200'}`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'}`}>{icon}</span>
    <span className="text-[11px] font-black uppercase tracking-widest flex-1 text-left">{label}</span>
    {count !== undefined && <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg ${active ? 'bg-white/20' : 'bg-slate-800'}`}>{count}</span>}
  </button>
);

const StatCard: React.FC<{ title: string, value: number | string, icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-[2rem] group hover:border-slate-700 transition-all relative overflow-hidden">
    <div className="relative z-10 flex flex-col gap-1">
      <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</div>
    </div>
    <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-500 rotate-12">
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 100 } as any) : null}
    </div>
  </div>
);

const LimitBar: React.FC<{ label: string, current: number, max: number, color: string }> = ({ label, current, max, color }) => (
  <div>
    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
       <span className="text-slate-500">{label}</span>
       <span className="text-slate-300">{Math.round((current/max)*100)}%</span>
    </div>
    <div className="h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
       <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{width: `${Math.min(100, (current/max)*100)}%`}}></div>
    </div>
  </div>
);

export default App;
