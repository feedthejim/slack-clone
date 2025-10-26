// Mock data for client-side use
const mockMessages = {
  '1': [
    { id: '1', text: 'Welcome to the general channel!', user: 'John Doe', timestamp: '2024-01-15T10:00:00Z' },
    { id: '2', text: 'How is everyone doing today?', user: 'Jane Smith', timestamp: '2024-01-15T10:05:00Z' },
    { id: '3', text: 'Great! Working on some new features', user: 'Mike Johnson', timestamp: '2024-01-15T10:10:00Z' },
  ],
  '2': [
    { id: '4', text: 'Anyone know a good coffee place nearby?', user: 'Sarah Wilson', timestamp: '2024-01-15T09:30:00Z' },
    { id: '5', text: 'Try the Blue Bottle on Main St', user: 'Tom Brown', timestamp: '2024-01-15T09:35:00Z' },
    { id: '6', text: 'That place has amazing pastries too!', user: 'Alice Cooper', timestamp: '2024-01-15T09:40:00Z' },
  ],
  '3': [
    { id: '7', text: 'Deployment scheduled for tonight', user: 'John Doe', timestamp: '2024-01-15T08:00:00Z' },
    { id: '8', text: 'All tests passing?', user: 'Jane Smith', timestamp: '2024-01-15T08:05:00Z' },
    { id: '9', text: 'Yes, all green!', user: 'Mike Johnson', timestamp: '2024-01-15T08:10:00Z' },
    { id: '10', text: 'Code review completed as well', user: 'Sarah Wilson', timestamp: '2024-01-15T08:15:00Z' },
  ],
  '4': [
    { id: '11', text: 'New mockups are ready for review', user: 'Alice Cooper', timestamp: '2024-01-15T11:00:00Z' },
    { id: '12', text: 'Love the color scheme!', user: 'Tom Brown', timestamp: '2024-01-15T11:05:00Z' },
    { id: '13', text: 'Should we A/B test the button placement?', user: 'Jane Smith', timestamp: '2024-01-15T11:10:00Z' },
    { id: '14', text: 'Good idea, let me set that up', user: 'Mike Johnson', timestamp: '2024-01-15T11:15:00Z' },
  ],
  '5': [
    { id: '15', text: 'Q4 campaign performance looks great!', user: 'Sarah Wilson', timestamp: '2024-01-15T14:00:00Z' },
    { id: '16', text: '25% increase in conversions', user: 'John Doe', timestamp: '2024-01-15T14:05:00Z' },
    { id: '17', text: 'The new landing pages are working well', user: 'Alice Cooper', timestamp: '2024-01-15T14:10:00Z' },
    { id: '18', text: 'Should we scale up the ad spend?', user: 'Tom Brown', timestamp: '2024-01-15T14:15:00Z' },
  ],
};

const mockChannelsClient = [
  { id: '1', name: 'general', isPrivate: false },
  { id: '2', name: 'random', isPrivate: false },
  { id: '3', name: 'dev-team', isPrivate: true },
  { id: '4', name: 'design', isPrivate: false },
  { id: '5', name: 'marketing', isPrivate: true },
];

const mockChannelsById = {
  '1': { id: '1', name: 'general', isPrivate: false },
  '2': { id: '2', name: 'random', isPrivate: false },
  '3': { id: '3', name: 'dev-team', isPrivate: true },
  '4': { id: '4', name: 'design', isPrivate: false },
  '5': { id: '5', name: 'marketing', isPrivate: true },
};

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
};

// Mock API for client-side operations
export const mockApi = {
  getChannels: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Object.values(mockChannelsById).map(c => ({ id: c.id, name: c.name, isPrivate: c.isPrivate }));
  },
  
  getMessages: async (channelId) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return mockMessages[channelId] || [];
  },
  
  getCurrentUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockUser;
  },
  
  sendMessage: async (channelId, message) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      user: mockUser.name,
      timestamp: new Date().toISOString(),
    };
    if (!mockMessages[channelId]) {
      mockMessages[channelId] = [];
    }
    mockMessages[channelId].push(newMessage);
    return newMessage;
  }
};