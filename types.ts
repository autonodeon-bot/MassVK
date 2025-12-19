
export enum TaskStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

export type AutomationStep = 'PROFILING' | 'SEARCHING' | 'SUBSCRIBING' | 'MONITORING' | 'CLIPS';

export type AIProviderType = 'Gemini' | 'ChatGPT' | 'Grok' | 'DeepSeek';

export interface AIAccount {
  id: string;
  name: string;
  provider: AIProviderType;
  apiKey: string;
  model: string;
  isActive: boolean;
  usageCount: number;
}

export interface VKAccount {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'banned';
  token: string;
  proxy: string;
  currentStep: AutomationStep;
  stats: {
    friendsAdded: number;
    groupsJoined: number;
    commentsPosted: number;
    clipsCommented: number;
  };
  limits: {
    friends: number;
    groups: number;
    comments: number;
  };
}

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
  onlyClosed: boolean;
  autoRepost: boolean;
}
