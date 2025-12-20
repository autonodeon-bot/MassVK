
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, Settings, Play, 
  Square, Activity, Plus, Terminal, BrainCircuit, Zap, 
  ShieldCheck, Image as ImageIcon, UserPlus, RefreshCw, Layers, Globe,
  Shield, CheckCircle2, AlertCircle, Database, Cpu, Bot
} from 'lucide-react';
import { VKAccount, LogEntry, TaskStatus, AutomationSettings, AIProviderId } from './types.ts';
import { MOCK_ACCOUNTS } from './constants.tsx';
import { GoogleGenAI } from "@google/genai";
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
    
    const provider = settings.activeAIProvider;
    addLog(`Запуск ШАГА 0: Массовое заполнение через ${provider.toUpperCase()}`, "warning");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    for (const acc of accounts) {
      if (acc.currentStep === 'STEP_0_FILLING' && acc.progress === 100) {
        addLog(`Пропуск ${acc.name} — уже заполнен`, "info", acc);
        continue;
      }

      addLog(`Генерация личности ИИ для ${acc.name}...`, "ai", acc);
      
      try {
        const response = await ai.models.generateContent({
          model: settings.aiConfigs.gemini.model,
          contents: `Создай уникальный профиль ВК для темы "${settings.profileTheme}". Имя пользователя: ${acc.name}. 
                     Верни JSON: { "bio": "короткое описание", "status": "статус", "interests": "список через запятую" }`,
          config: { responseMimeType: "application/json" }
        });
        
        addLog(`Данные получены: ${acc.name}`, "success", acc);
        
        const fillingSteps = [
          { msg: "Проверка прокси " + acc.proxy, progress: 20 },
          { msg: "Загрузка аватара и обложки...", progress: 50 },
          { msg: "Установка БИО и статуса...", progress: 85 },
          { msg: "Настройка приватности профиля...", progress: 100 },
        ];

        for (const step of fillingSteps) {
          await new Promise(r => setTimeout(r, 1200));
          addLog(step.msg, "info", acc);
          setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, progress: step.progress } : a));
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
    addLog("Массовое заполнение всех аккаунтов завершено!", "success");
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden select-none">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0b1120] border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase italic">Vk<span className="text-blue-500">Mass</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          <SidebarBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Дашборд" />
          <SidebarBtn active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={<Users size={18}/>} label="Аккаунты" count={accounts.length} />
          <SidebarBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Настройки" />
          <SidebarBtn active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Terminal size={18}/>} label="Лог системы" />
        </nav>

        <div className="p-4 space-y-3">
          <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Active: {settings.activeAIProvider}</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 transition-all duration-500" style={{width: isFilling ? '100%' : '30%'}}></div>
            </div>
          </div>
          <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 flex items-center gap-3">
             <ShieldCheck size={16} className="text-emerald-500" />
             <span className="text-[10px] font-bold text-emerald-500 uppercase">Antiban v4.2 ON</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617]">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Состояние</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === TaskStatus.RUNNING || isFilling ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                <span className="text-sm font-bold uppercase tracking-tight">{isFilling ? 'Заполнение...' : status}</span>
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
              {status === TaskStatus.RUNNING ? 'Остановить' : 'Запустить'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-8">
          {activeTab === 'dashboard' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                <div className="grid grid-cols-4 gap-6">
                   <StatCard title="Заполнено" value={accounts.filter(a => a.progress === 100).length} icon={<RefreshCw className="text-blue-500" />} />
                   <StatCard title="Комментарии" value={accounts.reduce((a, b) => a + b.stats.commentsPosted, 0)} icon={<MessageSquare className="text-indigo-500" />} />
                   <StatCard title="Proxy Nodes" value={accounts.length} icon={<Globe className="text-emerald-500" />} />
                   <StatCard title="Health Index" value="98%" icon={<Zap className="text-amber-500" />} />
                </div>

                <div className="grid grid-cols-3 gap-8">
                   <div className="col-span-2 bg-[#0b1120] border border-slate-800 rounded-[2.5rem] p-8">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Activity size={16} className="text-blue-500" /> Активность аккаунтов
                      </h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={accounts}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                               <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                               <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                               <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px'}} />
                               <Bar dataKey="stats.commentsPosted" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="bg-[#0b1120] border border-slate-800 rounded-[2.5rem] p-6 flex flex-col">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Terminal size={16} className="text-blue-500" /> Живой поток
                      </h3>
                      <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-3 pr-2 scrollbar-hide">
                         {logs.slice(0, 15).map(log => (
                           <div key={log.id} className="flex gap-2">
                              <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}]</span>
                              <span className={log.type === 'ai' ? 'text-indigo-400' : log.type === 'success' ? 'text-emerald-500' : 'text-slate-400'}>{log.message}</span>
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
                <div key={acc.id} className="bg-[#0b1120] border border-slate-800 rounded-[2.5rem] p-7 shadow-xl hover:border-blue-500/30 transition-all group">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative">
                      <img src={acc.avatar} className="w-20 h-20 rounded-3xl border-2 border-slate-800 object-cover shadow-2xl" alt="" />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#0b1120] ${acc.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-lg truncate tracking-tight">{acc.name}</h4>
                      <div className="flex flex-col gap-1 mt-1">
                         <span className="text-[10px] font-mono text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1.5 self-start">
                            <Globe size={10} /> {acc.proxy}
                         </span>
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{acc.currentStep || 'IDLE'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <LimitBar label="Прогресс заполнения" current={acc.progress || 0} max={100} color="bg-blue-600" />
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-[#020617] p-4 rounded-3xl border border-slate-800/50">
                          <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Комменты</div>
                          <div className="text-xl font-bold text-white">{acc.stats.commentsPosted}</div>
                       </div>
                       <div className="bg-[#020617] p-4 rounded-3xl border border-slate-800/50">
                          <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Лимиты</div>
                          <div className="text-xl font-bold text-emerald-500">{acc.limits.comments}</div>
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between">
                     <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Безопасность</span>
                     <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Trusted</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
              <div className="bg-[#0b1120] border border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                   <Bot size={200} />
                </div>
                
                <div>
                   <h3 className="text-xl font-bold text-white mb-2">Настройка ИИ-провайдеров</h3>
                   <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-10">Выберите движок для Шага 0 и генерации контента</p>
                   
                   <div className="grid grid-cols-1 gap-6">
                      <AIProviderCard 
                        id="gemini"
                        name="Google Gemini"
                        description="Рекомендуется. Высокая скорость и точное следование тематике."
                        active={settings.activeAIProvider === 'gemini'}
                        model={settings.aiConfigs.gemini.model}
                        onSelect={() => setSettings({...settings, activeAIProvider: 'gemini'})}
                      />
                      <AIProviderCard 
                        id="openai"
                        name="OpenAI ChatGPT"
                        description="Золотой стандарт. Глубокое понимание контекста и живые ответы."
                        active={settings.activeAIProvider === 'openai'}
                        model={settings.aiConfigs.openai.model}
                        onSelect={() => setSettings({...settings, activeAIProvider: 'openai'})}
                      />
                      <AIProviderCard 
                        id="grok"
                        name="xAI GROK"
                        description="Дерзкий и свободный. Идеально для привлечения внимания."
                        active={settings.activeAIProvider === 'grok'}
                        model={settings.aiConfigs.grok.model}
                        onSelect={() => setSettings({...settings, activeAIProvider: 'grok'})}
                      />
                   </div>
                </div>

                <div className="h-px bg-slate-800"></div>

                <section className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                        <BrainCircuit size={14} className="text-blue-500" /> Основная тема аккаунтов
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium"
                        value={settings.profileTheme}
                        onChange={(e) => setSettings({...settings, profileTheme: e.target.value})}
                      />
                   </div>

                   <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                        <MessageSquare size={14} className="text-blue-500" /> Ключевые слова для мониторинга
                      </label>
                      <textarea 
                        className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] text-white font-medium"
                        value={settings.keywords.join(', ')}
                        onChange={(e) => setSettings({...settings, keywords: e.target.value.split(',').map(s => s.trim())})}
                        placeholder="бизнес, инвестиции, криптовалюта..."
                      />
                   </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---

const AIProviderCard: React.FC<{
  id: string,
  name: string,
  description: string,
  active: boolean,
  model: string,
  onSelect: () => void
}> = ({ name, description, active, model, onSelect }) => (
  <div 
    onClick={onSelect}
    className={`p-6 rounded-[2rem] border cursor-pointer transition-all ${active ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10' : 'bg-[#0b1120] border-slate-800 hover:border-slate-700'}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex gap-4">
        <div className={`p-3 rounded-2xl ${active ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
          <Zap size={20} />
        </div>
        <div>
          <h4 className="font-bold text-white text-lg">{name}</h4>
          <p className="text-[11px] text-slate-500 mt-1 max-w-md">{description}</p>
        </div>
      </div>
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${active ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-600'}`}>
        {active ? 'Выбран' : 'Выбрать'}
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between">
       <span className="text-[9px] font-mono text-slate-600 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">{model}</span>
       {active && <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Ready to work</span>}
    </div>
  </div>
);

const SidebarBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number }> = ({ active, onClick, icon, label, count }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-200'}`}
  >
    {active && <div className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-white rounded-r-full shadow-[0_0_10px_white]"></div>}
    <span className={`${active ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'} transition-colors`}>{icon}</span>
    <span className="text-[11px] font-black uppercase tracking-widest flex-1 text-left">{label}</span>
    {count !== undefined && <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg ${active ? 'bg-white/20' : 'bg-slate-800'}`}>{count}</span>}
  </button>
);

const StatCard: React.FC<{ title: string, value: number | string, icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-[2.5rem] shadow-lg group hover:border-slate-700 transition-all relative overflow-hidden">
    <div className="relative z-10">
      <div className="text-3xl font-black text-white tracking-tighter mb-1">{value}</div>
      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</div>
    </div>
    <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
       {React.cloneElement(icon as React.ReactElement, { size: 120 })}
    </div>
  </div>
);

const LimitBar: React.FC<{ label: string, current: number, max: number, color: string }> = ({ label, current, max, color }) => (
  <div>
    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2.5">
       <span className="text-slate-500">{label}</span>
       <span className="text-slate-300">{Math.round((current/max)*100)}%</span>
    </div>
    <div className="h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
       <div 
         className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.2)]`} 
         style={{width: `${Math.min(100, (current/max)*100)}%`}}
        ></div>
    </div>
  </div>
);

export default App;
