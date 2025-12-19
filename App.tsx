
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Settings, 
  ShieldAlert, 
  Play, 
  Square, 
  Activity,
  Plus,
  Terminal,
  Globe,
  RefreshCw,
  Video,
  Search,
  UserPlus,
  Eye,
  CheckCircle2,
  Lock,
  Zap,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { VKAccount, LogEntry, TaskStatus, AutomationSettings, AutomationStep } from './types';
import { MOCK_ACCOUNTS, VK_LIMITS } from './constants';
import { generateVKComment } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<VKAccount[]>(MOCK_ACCOUNTS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.IDLE);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'settings' | 'proxies' | 'anticaptcha'>('dashboard');
  
  const [settings, setSettings] = useState<AutomationSettings>({
    keywords: ['бизнес', 'маркетинг', 'нейросети', 'крипта', 'инвестиции'],
    commentTemplate: 'Дружелюбный эксперт с легким юмором',
    minDelay: 15,
    maxDelay: 45,
    onlyClosed: true,
    autoRepost: true
  });

  const [antiCaptchaKey, setAntiCaptchaKey] = useState('6f5e4d3c2b1a0z9y8x7w');
  const [selectedCaptchaService, setSelectedCaptchaService] = useState('RuCaptcha');

  const timersRef = useRef<{ [key: string]: any }>({});

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', account: VKAccount) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      accountId: account.id,
      accountName: account.name,
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 150));
  }, []);

  const runAccountThread = useCallback(async (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account || status !== TaskStatus.RUNNING) return;

    const steps: AutomationStep[] = ['PROFILING', 'SEARCHING', 'SUBSCRIBING', 'MONITORING', 'CLIPS'];
    const currentStepIndex = steps.indexOf(account.currentStep);
    const nextStep = steps[(currentStepIndex + 1) % steps.length];

    let delay = Math.floor(Math.random() * (settings.maxDelay - settings.minDelay + 1) + settings.minDelay) * 1000;
    
    try {
      switch(nextStep) {
        case 'PROFILING':
          addLog(`Шаг 0: Обновление описания профиля и загрузка случайных фото через прокси ${account.proxy}`, 'info', account);
          if (settings.autoRepost) addLog(`Репост записи из популярного паблика для прогрева страницы`, 'info', account);
          break;

        case 'SEARCHING':
          const keyword = settings.keywords[Math.floor(Math.random() * settings.keywords.length)];
          addLog(`Шаг 1: Поиск целевых групп по ключу "${keyword}"`, 'info', account);
          break;

        case 'SUBSCRIBING':
          const filter = settings.onlyClosed ? "ТОЛЬКО ЗАКРЫТЫЕ" : "ВСЕ";
          addLog(`Шаг 2: Попытка вступления в паблик (Фильтр: ${filter})`, 'warning', account);
          setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, stats: { ...a.stats, groupsJoined: a.stats.groupsJoined + 1 } } : a));
          break;

        case 'MONITORING':
          addLog(`Шаг 3: Мониторинг ленты. Обнаружен свежий пост. Генерация ответа через Gemini...`, 'ai', account);
          const comment = await generateVKComment("Новые тренды в AI на 2025 год", settings.keywords, settings.commentTemplate);
          addLog(`Комментарий отправлен: "${comment}"`, 'success', account);
          setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, stats: { ...a.stats, commentsPosted: a.stats.commentsPosted + 1 } } : a));
          break;

        case 'CLIPS':
          addLog(`Шаг 4: Поиск релевантных VK Clips по хэштегам. Комментирование...`, 'info', account);
          setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, stats: { ...a.stats, clipsCommented: a.stats.clipsCommented + 1 } } : a));
          break;
      }

      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, currentStep: nextStep } : a));
    } catch (e) {
      addLog(`Ошибка в потоке: ${e}`, 'error', account);
    }

    timersRef.current[accountId] = setTimeout(() => runAccountThread(accountId), delay);
  }, [accounts, status, settings, addLog]);

  useEffect(() => {
    if (status === TaskStatus.RUNNING) {
      accounts.forEach(acc => {
        if (!timersRef.current[acc.id]) runAccountThread(acc.id);
      });
    } else {
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
    }
    return () => Object.values(timersRef.current).forEach(clearTimeout);
  }, [status, runAccountThread]);

  return (
    <div className="flex h-screen bg-[#0a0f18] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-lg shadow-blue-900/40">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">MassVK <span className="text-blue-500">Pro</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarLink active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Дашборд" />
          <SidebarLink active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={<Users size={18}/>} label="Аккаунты" count={accounts.length} />
          <SidebarLink active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Глобальные настройки" />
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Безопасность</div>
          <SidebarLink active={activeTab === 'proxies'} onClick={() => setActiveTab('proxies')} icon={<Globe size={18}/>} label="Прокси (Active)" />
          <SidebarLink active={activeTab === 'anticaptcha'} onClick={() => setActiveTab('anticaptcha')} icon={<ShieldAlert size={18}/>} label="Anti-Captcha" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
             <div className="flex justify-between items-center mb-2">
               <span className="text-xs font-semibold text-slate-400">Версия</span>
               <span className="text-xs text-blue-400">v2.4.0-stable</span>
             </div>
             <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 w-full"></div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-[#0a0f18] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
        
        {/* Top bar */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              {activeTab === 'dashboard' && "Общий мониторинг"}
              {activeTab === 'accounts' && "Менеджер аккаунтов"}
              {activeTab === 'settings' && "Конфигурация задач"}
              {activeTab === 'proxies' && "Менеджер Прокси"}
              {activeTab === 'anticaptcha' && "Сервисы Антикапчи"}
            </h2>
            <p className="text-slate-400 mt-1">Система управления массовыми коммуникациями</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-end mr-4">
               <div className="text-xs text-slate-500 font-mono">VK API: Connection Secure</div>
               <div className="text-xs text-emerald-500 font-mono flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 Proxies: 100% Online
               </div>
            </div>
            {status !== TaskStatus.RUNNING ? (
              <button 
                onClick={() => setStatus(TaskStatus.RUNNING)}
                className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Play size={20} fill="currentColor" /> Запустить комбайн
              </button>
            ) : (
              <button 
                onClick={() => setStatus(TaskStatus.IDLE)}
                className="flex items-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold shadow-xl shadow-rose-600/20 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Square size={20} fill="currentColor" /> Остановить всё
              </button>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard title="Комментарии (Посты)" value={accounts.reduce((a, b) => a + b.stats.commentsPosted, 0)} icon={<MessageSquare className="text-blue-400" />} trend="+45 сегодня" />
              <StatCard title="VK Clips (Ответы)" value={accounts.reduce((a, b) => a + b.stats.clipsCommented, 0)} icon={<Video className="text-purple-400" />} trend="+12 сегодня" />
              <StatCard title="Новые друзья" value={accounts.reduce((a, b) => a + b.stats.friendsAdded, 0)} icon={<Plus className="text-emerald-400" />} />
              <StatCard title="Средний Risk Score" value="Low" icon={<ShieldAlert className="text-amber-400" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Activity size={20} className="text-blue-500" />
                      Активность по аккаунтам
                    </h3>
                    <div className="flex gap-2">
                       <span className="flex items-center gap-1 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Комменты</span>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accounts}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} fontSize={12} />
                        <YAxis stroke="#64748b" axisLine={false} tickLine={false} fontSize={12} />
                        <Tooltip 
                          cursor={{fill: '#1e293b', opacity: 0.4}}
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                        />
                        <Bar dataKey="stats.commentsPosted" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                          {accounts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                   <StepCard number="0" label="Прогрев" active={status === TaskStatus.RUNNING} icon={<Eye size={16}/>} />
                   <StepCard number="1" label="Поиск" active={status === TaskStatus.RUNNING} icon={<Search size={16}/>} />
                   <StepCard number="2" label="Подписка" active={status === TaskStatus.RUNNING} icon={<UserPlus size={16}/>} />
                   <StepCard number="3" label="Комменты" active={status === TaskStatus.RUNNING} icon={<MessageSquare size={16}/>} />
                   <StepCard number="4" label="Клипы" active={status === TaskStatus.RUNNING} icon={<Video size={16}/>} />
                </div>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl flex flex-col h-[650px] shadow-2xl relative overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <div className="flex items-center gap-2 font-bold text-slate-300">
                    <Terminal size={18} className="text-blue-500" />
                    Системный поток
                  </div>
                  <div className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest">Live</div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3 font-mono text-[11px] scrollbar-thin scrollbar-thumb-slate-800">
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 text-center p-6">
                       <Terminal size={40} className="mb-4 opacity-20" />
                       <p>Ожидание команды запуска...</p>
                    </div>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="animate-in slide-in-from-left-2 duration-300">
                        <div className="flex items-center gap-2 mb-0.5">
                           <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                           <span className="text-blue-400 font-bold">@{log.accountName}:</span>
                        </div>
                        <div className={`pl-4 border-l border-slate-800 ml-1 py-1
                          ${log.type === 'success' ? 'text-emerald-400' : ''}
                          ${log.type === 'error' ? 'text-rose-400' : ''}
                          ${log.type === 'warning' ? 'text-amber-400 font-semibold' : ''}
                          ${log.type === 'ai' ? 'text-indigo-400 italic' : 'text-slate-300'}
                        `}>
                          {log.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'accounts' && (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             {accounts.map(acc => (
               <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-blue-500/50 transition-all group">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <img src={acc.avatar} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-800 group-hover:ring-blue-500 transition-all" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{acc.name}</h4>
                      <p className="text-xs text-slate-500 font-mono truncate">{acc.proxy}</p>
                    </div>
                    <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-500"><Settings size={18}/></button>
                 </div>

                 <div className="space-y-4">
                    <LimitIndicator label="Дневные лимиты ВК (Друзья)" current={acc.stats.friendsAdded} max={VK_LIMITS.FRIENDS_PER_DAY} color="bg-blue-500" />
                    <LimitIndicator label="Дневные лимиты ВК (Группы)" current={acc.stats.groupsJoined} max={VK_LIMITS.GROUPS_PER_DAY} color="bg-indigo-500" />
                    <LimitIndicator label="Дневные лимиты ВК (Комменты)" current={acc.stats.commentsPosted} max={VK_LIMITS.COMMENTS_PER_DAY} color="bg-purple-500" />
                 </div>

                 <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between">
                    <div className="text-center">
                       <div className="text-xs text-slate-500 mb-1">Clips</div>
                       <div className="font-bold text-white">{acc.stats.clipsCommented}</div>
                    </div>
                    <div className="text-center">
                       <div className="text-xs text-slate-500 mb-1">Step</div>
                       <div className="font-bold text-blue-400 text-xs">{acc.currentStep}</div>
                    </div>
                    <div className="text-center">
                       <div className="text-xs text-slate-500 mb-1">Status</div>
                       <div className="font-bold text-emerald-500 text-xs uppercase tracking-tighter">Active</div>
                    </div>
                 </div>
               </div>
             ))}
             <button className="border-2 border-dashed border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                <div className="p-4 bg-slate-900 rounded-full"><Plus size={32}/></div>
                <span className="font-bold">Добавить аккаунт</span>
             </button>
           </div>
        )}

        {activeTab === 'settings' && (
           <div className="max-w-4xl space-y-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Search size={20} className="text-blue-500" /> Настройки поиска и ИИ</h3>
                 <div className="space-y-6">
                    <div>
                       <label className="block text-sm font-semibold text-slate-400 mb-3">Ключевые слова для мониторинга (через запятую)</label>
                       <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                        value={settings.keywords.join(", ")}
                        onChange={(e) => setSettings({...settings, keywords: e.target.value.split(",").map(s => s.trim())})}
                        rows={3}
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-slate-400 mb-3">Tone of Voice для ИИ ( Gemini Prompt )</label>
                       <input 
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500"
                        value={settings.commentTemplate}
                        onChange={(e) => setSettings({...settings, commentTemplate: e.target.value})}
                       />
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldAlert size={20} className="text-amber-500" /> Алгоритмы безопасности</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <div className="flex justify-between">
                          <span className="text-sm font-medium">Мин. пауза (сек)</span>
                          <span className="text-blue-400 font-bold">{settings.minDelay}с</span>
                       </div>
                       <input type="range" min="5" max="300" className="w-full" value={settings.minDelay} onChange={(e) => setSettings({...settings, minDelay: Number(e.target.value)})} />
                       
                       <div className="flex justify-between pt-4">
                          <span className="text-sm font-medium">Макс. пауза (сек)</span>
                          <span className="text-blue-400 font-bold">{settings.maxDelay}с</span>
                       </div>
                       <input type="range" min="30" max="1200" className="w-full" value={settings.maxDelay} onChange={(e) => setSettings({...settings, maxDelay: Number(e.target.value)})} />
                    </div>
                    
                    <div className="space-y-3">
                       <Toggle label="Только закрытые сообщества" description="Игнорировать открытые группы (Шаг 2)" checked={settings.onlyClosed} onChange={(val) => setSettings({...settings, onlyClosed: val})} />
                       <Toggle label="Авто-репосты (Прогрев)" description="Имитация активности реального пользователя" checked={settings.autoRepost} onChange={(val) => setSettings({...settings, autoRepost: val})} />
                       <Toggle label="Мульти-прокси" description="Использование разных IP для каждого потока" checked={true} onChange={() => {}} />
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'proxies' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4">
                <Globe className="text-blue-400" size={24} />
                <div>
                  <div className="text-sm font-bold text-blue-400 tracking-wide uppercase">Активный пул</div>
                  <div className="text-2xl font-black text-white">{accounts.length} / 12</div>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                <Plus size={20} /> Добавить список прокси
              </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">IP:PORT</th>
                    <th className="px-6 py-4">Тип</th>
                    <th className="px-6 py-4">Аккаунт</th>
                    <th className="px-6 py-4">Локация</th>
                    <th className="px-6 py-4 text-center">Пинг</th>
                    <th className="px-6 py-4 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {accounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-blue-400">{acc.proxy}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">HTTP/S</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img src={acc.avatar} className="w-6 h-6 rounded-md" />
                          <span className="text-sm font-medium">{acc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">RU / Moscow</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black tracking-widest">
                          {Math.floor(Math.random() * 200) + 50}ms
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"><RefreshCw size={14} /></button>
                          <button className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'anticaptcha' && (
          <div className="max-w-4xl space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <ShieldAlert className="text-amber-500" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Решение капчи</h3>
                  <p className="text-slate-500 text-sm italic">Автоматическое прохождение проверок ВК</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Сервис решения</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['RuCaptcha', '2Captcha', 'Anti-Captcha', 'CapMonster'].map(service => (
                        <button 
                          key={service}
                          onClick={() => setSelectedCaptchaService(service)}
                          className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedCaptchaService === service ? 'border-blue-600 bg-blue-600/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'}`}
                        >
                          <span className={`text-sm font-bold ${selectedCaptchaService === service ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{service}</span>
                          {selectedCaptchaService === service && <CheckCircle2 size={16} className="text-blue-500" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">API KEY (Secret)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="password"
                        value={antiCaptchaKey}
                        onChange={(e) => setAntiCaptchaKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-all"
                        placeholder="Введите ваш ключ..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Баланс сервиса</span>
                      <span className="text-emerald-500 text-sm font-black">$14.52</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Решено сегодня</span>
                        <span className="text-white font-bold">142</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Ср. время решения</span>
                        <span className="text-white font-bold">4.2 сек</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Загрузка сервиса</span>
                        <span className="text-amber-500 font-bold">Низкая</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="mt-8 w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group">
                    <Zap size={18} className="text-amber-500 group-hover:scale-125 transition-all" /> Проверить соединение
                  </button>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-600/5 border border-blue-600/20 rounded-2xl flex items-start gap-4">
                 <ShieldAlert className="text-blue-500 shrink-0" size={20} />
                 <p className="text-[11px] leading-relaxed text-slate-400">
                   <strong>Важно:</strong> Для каждого аккаунта ВК рекомендуется использовать выделенный прокси. Сервис Антикапчи срабатывает автоматически при появлении проверки на "человечность" во время поиска или комментирования. Мы рекомендуем RuCaptcha или 2Captcha для работы в СНГ сегменте.
                 </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const SidebarLink: React.FC<{ active: boolean, icon: React.ReactNode, label: string, count?: number, onClick?: () => void }> = ({ active, icon, label, count, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3.5 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
  >
    {icon}
    <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
    {count !== undefined && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-slate-800'}`}>{count}</span>}
  </button>
);

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, trend?: string }> = ({ title, value, icon, trend }) => (
  <div className="bg-[#111827]/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-black/20 group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-900 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {trend && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-bold">{trend}</span>}
    </div>
    <div className="text-3xl font-black text-white mb-1 tracking-tight">{value}</div>
    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</div>
  </div>
);

const LimitIndicator: React.FC<{ label: string, current: number, max: number, color: string }> = ({ label, current, max, color }) => {
  const percent = Math.min((current / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1.5">
        <span className="text-slate-400 font-bold uppercase tracking-tighter">{label}</span>
        <span className="text-slate-200 font-mono">{current} / {max}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden p-[2px]">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

const StepCard: React.FC<{ number: string, label: string, active: boolean, icon: React.ReactNode }> = ({ number, label, active, icon }) => (
  <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${active ? 'bg-blue-600/5 border-blue-500/50 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-600 grayscale'}`}>
     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 ${active ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-800'}`}>
        {number}
     </div>
     <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-center">
        {icon}
        {label}
     </div>
  </div>
);

const Toggle: React.FC<{ label: string, description: string, checked: boolean, onChange: (val: boolean) => void }> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
     <div className="flex-1">
        <div className="text-sm font-bold text-slate-200">{label}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">{description}</div>
     </div>
     <div 
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${checked ? 'bg-blue-600' : 'bg-slate-800'}`}
     >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'translate-x-6' : ''}`}></div>
     </div>
  </div>
);

export default App;
