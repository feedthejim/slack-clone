// Mock data
const mockChannelsById = {
  1: {
    id: "1",
    name: "general",
    isPrivate: false,
    description: "General discussion channel",
    memberCount: 42,
    topic:
      "Welcome to the general channel! Feel free to discuss anything here.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  2: {
    id: "2",
    name: "random",
    isPrivate: false,
    description: "Random conversations",
    memberCount: 38,
    topic: "Random thoughts, fun discussions, and off-topic chatter.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  3: {
    id: "3",
    name: "dev-team",
    isPrivate: true,
    description: "Development team discussions",
    memberCount: 12,
    topic: "Development discussions, code reviews, and technical planning.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  4: {
    id: "4",
    name: "design",
    isPrivate: false,
    description: "Design discussions and feedback",
    memberCount: 18,
    topic: "Design reviews, feedback, and creative collaboration.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  5: {
    id: "5",
    name: "marketing",
    isPrivate: true,
    description: "Marketing team coordination",
    memberCount: 8,
    topic: "Marketing campaigns, strategies, and team coordination.",
    createdAt: "2024-01-01T00:00:00Z",
  },
};

// Channel data functions
export async function getChannels() {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return Object.values(mockChannelsById);
}

export async function getChannelById(channelId) {
  "use cache";
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return mockChannelsById[channelId] || null;
}
