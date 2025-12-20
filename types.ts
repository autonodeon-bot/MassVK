
export enum TaskStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  INITIALIZING = 'INITIALIZING',
  ERROR = 'ERROR'
}

export type AutomationStep = 'IDLE' | 'STEP_0_FILLING' | 'PROFILING' | 'SEARCHING' | 'SUBSCRIBING' | 'MONITORING' | 'CLIPS';

// Интерфейс для AI аккаунтов (Gemini, DeepSeek и др.)
export type AIAccount = {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  model: string;
  isActive: boolean;
  usageCount: number;
};

export type VKAccount = {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'banned';
  token: string;
  proxy: string;
  currentStep: AutomationStep;
  progress: number;
  stats: {
    friendsAdded: number;
    groupsJoined: number;
    commentsPosted: number;
    clipsCommented: number;
  };
  // Лимиты для безопасной автоматизации
  limits: {
    friends: number;
    groups: number;
    comments: number;
  };
};

export interface LogEntry {
  id: string;
  timestamp: number;
  accountId: string;
  accountName: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
}

export interface AutomationSettings {
  keywords: string[];
  commentTemplate: string;
  minDelay: number;
  maxDelay: number;
  profileTheme: string;
}
