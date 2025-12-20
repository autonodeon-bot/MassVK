
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, Settings, Play, 
  Square, Activity, Plus, Terminal, BrainCircuit, Zap, 
  ShieldCheck, Image as ImageIcon, UserPlus, RefreshCw, Layers, Globe,
  Shield, CheckCircle2, AlertCircle, Database, Cpu, Eye, EyeOff, Bot
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
    addLog(`Запуск ШАГА 0 через ${provider.toUpperCase()}...`, "warning");

    // Инициализация GoogleGenAI производится непосредственно перед вызовом API
    // Ключ берется строго из process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    for (const acc of accounts) {
      if (acc.currentStep === 'STEP_0_FILLING' && acc.progress === 100) continue;

      addLog(`Генерация личности для ${acc.name}...`, "ai", acc);
      
      try {
        const response = await ai.models.generateContent({
          model: settings.aiConfigs.gemini.model,
          contents: `Создай профиль ВК для темы "${settings.profileTheme}". Имя: ${acc.name}. JSON: { "bio": "", "status": "", "interests": [] }`,
          config: { responseMimeType: "application/json" }
        });
        
        addLog(`ИИ успешно подготовил данные для ${acc.name}`, "success", acc);
        
        const steps = [
          { msg: "Эмуляция прокси-соединения...", progress: 30 },
          { msg: "Обновление медиа-контента...", progress: 60 },
          { msg: "Заполнение анкетных данных...", progress: 100 },
        ];

        for (const step of steps) {
          await new Promise(r => setTimeout(r, 1000));
          addLog(step.msg, "info", acc);
          setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, progress: step.progress } : a));
        }

        setAccounts(prev => prev.map(a => a.id === acc.id ? { 
          ...a, 
          currentStep: 'STEP_0_FILLING',
          progress: 100 
        } : a));

      } catch (e) {
        addLog(`Ошибка провайдера ${provider}: ${acc.name}`, "error", acc);
      }
    }

    setIsFilling(false);
    setStatus(TaskStatus.IDLE);
    addLog("Массовое заполнение завершено.", "success");
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden select-none">
      <aside className="w-64 bg-[#0b1120] border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase">Vk<span className="text-blue-500">Mass</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          <SidebarBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Дашборд" />
          <SidebarBtn active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={<Users size={18}/>} label="Аккаунты" count={accounts.length} />
          <SidebarBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Настройки" />
          <SidebarBtn active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Terminal size={18}/>} label="Системный лог" />
        </nav>

        <div className="p-4 space-y-3">
          <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Active AI: {settings.activeAIProvider}</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 w-2/3"></div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#020617]">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Статус</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === TaskStatus.RUNNING ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className="text-sm font-bold">{status}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={startMassFilling}
              disabled={isFilling}
              className="flex items-center gap-3 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all"
            >
              <RefreshCw size={14} className={isFilling ? 'animate-spin' : ''} /> 
              Mass Fill
            </button>
            <button 
              onClick={() => setStatus(status === TaskStatus.RUNNING ? TaskStatus.IDLE : TaskStatus.RUNNING)}
              className="px-8 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-600/30 active:scale-95 transition-all"
            >
              {status === TaskStatus.RUNNING ? 'Стоп' : 'Старт'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {activeTab === 'dashboard' && (
             <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard title="Заполнено" value={accounts.filter(a => a.progress === 100).length} icon={<RefreshCw className="text-blue-500" />} />
                <StatCard title="Proxy Nodes" value={accounts.length} icon={<Globe className="text-emerald-500" />} />
                <StatCard title="AI Provider" value={settings.activeAIProvider.toUpperCase()} icon={<BrainCircuit className="text-indigo-500" />} />
                <StatCard title="Health" value="100%" icon={<ShieldCheck className="text-emerald-400" />} />
             </div>
          )}

          {activeTab === 'accounts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map(acc => (
                <div key={acc.id} className="bg-[#0b1120] border border-slate-800 rounded-[2.5rem] p-7 shadow-xl">
                  <div className="flex items-center gap-5 mb-8">
                    <img src={acc.avatar} className="w-16 h-16 rounded-2xl border-2 border-slate-800 object-cover" alt="" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-lg truncate">{acc.name}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{acc.proxy}</span>
                    </div>
                  </div>
                  <LimitBar label="Progress" current={acc.progress || 0} max={100} color="bg-blue-500" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
              {/* AI INTEGRATIONS SECTION */}
              <div className="bg-[#0b1120] border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                      <Bot size={24} className="text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Интеграции нейросетей</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Выбор активного ИИ провайдера</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Provider Card: Gemini */}
                  <AIProviderCard 
                    id="gemini"
                    name="Google Gemini"
                    description="Рекомендуется для автоматизации и генерации контента."
                    active={settings.activeAIProvider === 'gemini'}
                    config={settings.aiConfigs.gemini}
                    onSelect={() => setSettings({...settings, activeAIProvider: 'gemini'})}
                  />

                  {/* Provider Card: OpenAI */}
                  <AIProviderCard 
                    id="openai"
                    name="OpenAI ChatGPT"
                    description="Высокое качество ответов, идеально для сложных тематик."
                    active={settings.activeAIProvider === 'openai'}
                    config={settings.aiConfigs.openai}
                    onSelect={() => setSettings({...settings, activeAIProvider: 'openai'})}
                  />

                  {/* Provider Card: GROK */}
                  <AIProviderCard 
                    id="grok"
                    name="xAI GROK"
                    description="Нефильтрованные, живые и дерзкие комментарии."
                    active={settings.activeAIProvider === 'grok'}
                    config={settings.aiConfigs.grok}
                    onSelect={() => setSettings({...settings, activeAIProvider: 'grok'})}
                  />
                </div>
              </div>

              {/* GENERAL SETTINGS SECTION */}
              <div className="bg-[#0b1120] border border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-2xl">
                 <section>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                    <BrainCircuit size={14} className="text-blue-500" /> Тематика аккаунтов
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white"
                    value={settings.profileTheme}
                    onChange={(e) => setSettings({...settings, profileTheme: e.target.value})}
                  />
                </section>

                <section>
                   <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Ключевые слова</label>
                  <textarea 
                    className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-white"
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

// --- Sub-components ---

const AIProviderCard: React.FC<{
  id: string,
  name: string,
  description: string,
  active: boolean,
  config: { model: string },
  onSelect: () => void
}> = ({ name, description, active, config, onSelect }) => (
  <div className={`p-6 rounded-[2rem] border transition-all ${active ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5' : 'bg-[#020617] border-slate-800 hover:border-slate-700'}`}>
    <div className="flex items-start justify-between">
      <div className="flex gap-4">
        <div className={`p-3 rounded-2xl ${active ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
          <Zap size={20} />
        </div>
        <div>
          <h4 className="font-bold text-white">{name}</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button 
        onClick={onSelect}
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
      >
        {active ? 'Active' : 'Select'}
      </button>
    </div>

    <div className="mt-4 flex items-center justify-between">
      <div className="flex-1">
        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 block">Model</label>
        <span className="text-[10px] font-bold text-slate-400 font-mono">{config.model}</span>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-bold ${active ? 'text-emerald-500 bg-emerald-500/5' : 'text-slate-600 bg-slate-900'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
        {active ? 'READY' : 'STANDBY'}
      </div>
    </div>
  </div>
);

const SidebarBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number }> = ({ active, onClick, icon, label, count }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-200'}`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'}`}>{icon}</span>
    <span className="text-[11px] font-black uppercase tracking-widest flex-1 text-left">{label}</span>
    {count !== undefined && <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${active ? 'bg-white/20' : 'bg-slate-800'}`}>{count}</span>}
  </button>
);

const StatCard: React.FC<{ title: string, value: number | string, icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-[2rem] shadow-lg group hover:border-slate-700 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-900 rounded-xl">{icon}</div>
    </div>
    <div className="text-2xl font-black text-white">{value}</div>
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{title}</div>
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
