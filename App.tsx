
import React, { useState, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, Settings, 
  Terminal, BrainCircuit, Zap, ShieldCheck, RefreshCw, 
  Layers, Globe, CheckCircle2, Database, Cpu, Bot,
  Activity
} from 'lucide-react';
import { VKAccount, LogEntry, TaskStatus, AutomationSettings } from './types.ts';
import { MOCK_ACCOUNTS } from './constants.tsx';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    profileTheme: 'Технологический предприниматель / ИИ энтузиаст',
    activeAIProvider: 'gemini',
    aiConfigs: {
      gemini: { model: 'gemini-3-flash-preview', enabled: true },
      openai: { model: 'gpt-4o-mini', enabled: false },
      grok: { model: 'grok-beta', enabled: false }
    }
  });

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', account?: VKAccount) => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      accountId: account?.id || 'system',
      accountName: account?.name || 'Система',
      message,
      type
    }, ...prev].slice(0, 100));
  }, []);

  const startMassFilling = async () => {
    if (isFilling) return;
    setIsFilling(true);
    setStatus(TaskStatus.INITIALIZING);
    
    addLog(`Инициализация ШАГА 0: Массовое заполнение (ИИ: ${settings.activeAIProvider.toUpperCase()})`, "warning");

    // Инициализация GoogleGenAI согласно правилам: только объект с apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    for (const acc of accounts) {
      if (acc.progress === 100) {
        addLog(`Аккаунт ${acc.name} уже готов`, "info", acc);
        continue;
      }

      addLog(`Генерация "личности" для ${acc.name}...`, "ai", acc);
      
      try {
        // Использование responseSchema для надежного получения JSON данных согласно гайдлайнам
        const response = await ai.models.generateContent({
          model: settings.aiConfigs.gemini.model,
          contents: `Создай описание профиля ВК. Тема: ${settings.profileTheme}. Имя: ${acc.name}.`,
          config: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                bio: { type: Type.STRING, description: 'Описание профиля' },
                status: { type: Type.STRING, description: 'Статус профиля' },
                interests: { type: Type.STRING, description: 'Интересы через запятую' }
              },
              propertyOrdering: ["bio", "status", "interests"]
            }
          }
        });
        
        const profileData = JSON.parse(response.text || '{}');
        addLog(`Профиль сформирован (${profileData.status}). Начинаю загрузку в ВК...`, "success", acc);
        
        const steps = [
          { m: "Проверка Proxy...", p: 25 },
          { m: "Загрузка аватара...", p: 50 },
          { m: "Сохранение БИО...", p: 75 },
          { m: "Настройка приватности...", p: 100 }
        ];

        for (const s of steps) {
          await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
          setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, progress: s.p, currentStep: 'STEP_0_FILLING' } : a));
          addLog(s.m, "info", acc);
        }

        addLog(`Аккаунт ${acc.name} полностью настроен.`, "success", acc);
      } catch (e) {
        addLog(`Критическая ошибка заполнения: ${acc.name}`, "error", acc);
      }
    }

    setIsFilling(false);
    setStatus(TaskStatus.IDLE);
    addLog("Массовое заполнение завершено.", "success");
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0b1120] border-r border-slate-800 flex flex-col shrink-0 z-20">
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase italic">Vk<span className="text-blue-500">Mass</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          <SidebarBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Дашборд" />
          <SidebarBtn active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={<Users size={18}/>} label="Аккаунты" count={accounts.length} />
          <SidebarBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Настройки ИИ" />
          <SidebarBtn active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Terminal size={18}/>} label="Системный лог" />
        </nav>

        <div className="p-4 space-y-3">
          <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Active: {settings.activeAIProvider}</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 transition-all duration-700" style={{width: isFilling ? '100%' : '20%'}}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617] relative">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Глобальный процесс</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === TaskStatus.RUNNING || isFilling ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className="text-sm font-bold uppercase tracking-tight">{isFilling ? 'МАССОВОЕ ЗАПОЛНЕНИЕ...' : status}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={startMassFilling}
              disabled={isFilling}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${isFilling ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'}`}
            >
              <RefreshCw size={14} className={isFilling ? 'animate-spin' : ''} /> 
              Step 0: Mass Fill
            </button>
            <button 
              onClick={() => setStatus(status === TaskStatus.RUNNING ? TaskStatus.IDLE : TaskStatus.RUNNING)}
              className="px-8 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-blue-600 text-white shadow-2xl shadow-blue-600/30 active:scale-95 transition-all"
            >
              {status === TaskStatus.RUNNING ? 'Стоп' : 'Старт Цикла'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-8">
          {activeTab === 'dashboard' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   <StatCard title="Ready Profiles" value={accounts.filter(a => a.progress === 100).length} icon={<CheckCircle2 className="text-emerald-500" />} />
                   <StatCard title="Comments" value={accounts.reduce((a, b) => a + b.stats.commentsPosted, 0)} icon={<MessageSquare className="text-blue-500" />} />
                   <StatCard title="Proxy Nodes" value={accounts.length} icon={<Globe className="text-indigo-500" />} />
                   <StatCard title="AI Operations" value={logs.filter(l => l.type === 'ai').length} icon={<BrainCircuit className="text-amber-500" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 bg-[#0b1120] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Activity size={16} className="text-blue-500" /> Статистика прогресса
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
                                 contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px'}} 
                               />
                               <Bar dataKey="progress" radius={[6, 6, 0, 0]} barSize={45}>
                                  {accounts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10b981' : '#3b82f6'} />
                                  ))}
                               </Bar>
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="bg-[#0b1120] border border-slate-800 rounded-[2.5rem] p-6 flex flex-col shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Terminal size={16} className="text-blue-500" /> Системные события
                        </h3>
                      </div>
                      <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-3 pr-2 scrollbar-hide">
                         {logs.length === 0 ? <div className="text-slate-700 italic">Ожидание активности...</div> : logs.map(log => (
                           <div key={log.id} className="animate-in slide-in-from-left-2 duration-300 flex gap-2">
                              <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}]</span>
                              <span className={clsxLog(log.type)}>{log.message}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'accounts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-500">
              {accounts.map(acc => (
                <div key={acc.id} className="bg-[#0b1120] border border-slate-800 rounded-[2.5rem] p-7 shadow-xl hover:border-blue-500/30 transition-all group overflow-hidden relative">
                  <div className="flex items-center gap-5 mb-8">
                    <img src={acc.avatar} className="w-16 h-16 rounded-2xl border-2 border-slate-800 object-cover" alt="" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-lg truncate tracking-tight">{acc.name}</h4>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{acc.currentStep || 'IDLE'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <LimitBar label="Filling Status" current={acc.progress || 0} max={100} color={acc.progress === 100 ? "bg-emerald-500" : "bg-blue-600"} />
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-4 border-t border-slate-800/50">
                       <span className="flex items-center gap-2"><Globe size={12}/> {acc.proxy}</span>
                       <span className="bg-slate-900 px-2 py-0.5 rounded text-emerald-500 font-bold uppercase tracking-widest">Safe</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500">
              <div className="bg-[#0b1120] border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Bot size={180} /></div>
                 
                 <div>
                    <h3 className="text-xl font-bold text-white mb-2">Настройка ИИ-Провайдеров</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-8">Выберите активную нейросеть для Шага 0</p>
                    
                    <div className="grid grid-cols-1 gap-4">
                       <AIProviderCard 
                         name="Google Gemini"
                         desc="Высокая скорость, идеально для заполнения анкет."
                         active={settings.activeAIProvider === 'gemini'}
                         onSelect={() => setSettings({...settings, activeAIProvider: 'gemini'})}
                       />
                       <AIProviderCard 
                         name="OpenAI ChatGPT"
                         desc="Лучшее качество текстов для комментирования."
                         active={settings.activeAIProvider === 'openai'}
                         onSelect={() => setSettings({...settings, activeAIProvider: 'openai'})}
                       />
                       <AIProviderCard 
                         name="xAI GROK"
                         desc="Актуальные тренды и хайповые ответы."
                         active={settings.activeAIProvider === 'grok'}
                         onSelect={() => setSettings({...settings, activeAIProvider: 'grok'})}
                       />
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-800 space-y-6">
                    <div>
                       <label className="block text-[10px] font-black uppercase text-slate-500 mb-3">Тематика профилей</label>
                       <input 
                         type="text" 
                         className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-white"
                         value={settings.profileTheme}
                         onChange={(e) => setSettings({...settings, profileTheme: e.target.value})}
                       />
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---

const AIProviderCard: React.FC<{ name: string, desc: string, active: boolean, onSelect: () => void }> = ({ name, desc, active, onSelect }) => (
  <div 
    onClick={onSelect}
    className={`p-5 rounded-2xl border cursor-pointer transition-all ${active ? 'bg-blue-600/10 border-blue-500/50' : 'bg-[#020617] border-slate-800 hover:border-slate-700'}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex gap-4 items-center">
        <div className={`p-2 rounded-lg ${active ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'}`}><Zap size={18} /></div>
        <div>
          <h4 className="font-bold text-white text-sm">{name}</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className={`w-4 h-4 rounded-full border-4 border-[#0b1120] ${active ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
    </div>
  </div>
);

const SidebarBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number }> = ({ active, onClick, icon, label, count }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-200'}`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'}`}>{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest flex-1 text-left">{label}</span>
    {count !== undefined && <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${active ? 'bg-white/20' : 'bg-slate-800'}`}>{count}</span>}
  </button>
);

const StatCard: React.FC<{ title: string, value: number | string, icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-[2rem] shadow-xl group hover:border-slate-700 transition-all relative overflow-hidden">
    <div className="relative z-10">
      <div className="text-2xl font-black text-white tracking-tight mb-1">{value}</div>
      <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{title}</div>
    </div>
    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">{React.cloneElement(icon as React.ReactElement, { size: 80 })}</div>
  </div>
);

const LimitBar: React.FC<{ label: string, current: number, max: number, color: string }> = ({ label, current, max, color }) => (
  <div>
    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-2 text-slate-500">
       <span>{label}</span>
       <span className="text-slate-300">{Math.round((current/max)*100)}%</span>
    </div>
    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
       <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{width: `${(current/max)*100}%`}}></div>
    </div>
  </div>
);

const clsxLog = (type: LogEntry['type']) => {
  switch(type) {
    case 'ai': return 'text-indigo-400 font-medium italic';
    case 'success': return 'text-emerald-500 font-bold';
    case 'error': return 'text-rose-400 font-bold';
    case 'warning': return 'text-amber-500 font-bold';
    default: return 'text-slate-400';
  }
};

export default App;
