
export const VK_LIMITS = {
  FRIENDS_PER_DAY: 50,
  GROUPS_PER_DAY: 40,
  COMMENTS_PER_DAY: 100,
  CLIPS_COMMENTS_PER_DAY: 50
};

export const MOCK_ACCOUNTS: any[] = [
  {
    id: 'acc_1',
    name: 'Ivan Tech',
    avatar: 'https://i.pravatar.cc/150?u=acc_1',
    status: 'online',
    token: 'vk_access_token_1',
    proxy: '185.12.33.11:3128',
    currentStep: 'IDLE',
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
    stats: { friendsAdded: 5, groupsJoined: 2, commentsPosted: 15, clipsCommented: 3 },
    limits: { friends: 50, groups: 40, comments: 100 }
  },
  {
    id: 'acc_3',
    name: 'Bot Master',
    avatar: 'https://i.pravatar.cc/150?u=acc_3',
    status: 'online',
    token: 'vk_access_token_3',
    proxy: '91.210.165.55:1080',
    currentStep: 'IDLE',
    stats: { friendsAdded: 25, groupsJoined: 18, commentsPosted: 88, clipsCommented: 41 },
    limits: { friends: 50, groups: 40, comments: 100 }
  }
];
