
import { AIAccount, VKAccount } from './types.ts';

export const VK_LIMITS = {
  FRIENDS_PER_DAY: 50,
  GROUPS_PER_DAY: 40,
  COMMENTS_PER_DAY: 100,
  CLIPS_COMMENTS_PER_DAY: 50
};

export const MOCK_AI_ACCOUNTS: AIAccount[] = [
  {
    // Исправлено: ID теперь соответствует типу AIProviderId
    id: 'gemini',
    name: 'Основной Gemini',
    provider: 'Gemini',
    model: 'gemini-3-flash-preview',
    isActive: true,
    usageCount: 145
  },
  {
    // Исправлено: ID теперь соответствует типу AIProviderId
    id: 'openai',
    name: 'OpenAI Pro',
    provider: 'OpenAI',
    model: 'gpt-4o',
    isActive: false,
    usageCount: 12
  },
  {
    // Исправлено: ID теперь соответствует типу AIProviderId
    id: 'grok',
    name: 'Grok-1.0',
    provider: 'Grok',
    model: 'grok-beta',
    isActive: false,
    usageCount: 0
  }
];

export const MOCK_ACCOUNTS: VKAccount[] = [
  {
    id: 'acc_1',
    name: 'Ivan Tech',
    avatar: 'https://i.pravatar.cc/150?u=acc_1',
    status: 'online',
    token: 'vk_access_token_1',
    proxy: '185.12.33.11:3128',
    currentStep: 'IDLE',
    progress: 0,
    stats: { friendsAdded: 14, groupsJoined: 8, commentsPosted: 42, clipsCommented: 12 },
    limits: { friends: 50, groups: 40, comments: 100 }
  },
  {
    id: 'acc_2',
    name: 'SMM Queen',
    avatar: 'https://i.pravatar.cc/150?u=acc_2',
    status: 'online',
    token: 'vk_access_token_2',
    proxy: '45.155.203.1:8000',
    currentStep: 'IDLE',
    progress: 0,
    stats: { friendsAdded: 5, groupsJoined: 2, commentsPosted: 15, clipsCommented: 3 },
    limits: { friends: 50, groups: 40, comments: 100 }
  }
];
