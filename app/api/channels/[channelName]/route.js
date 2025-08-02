import { NextResponse } from "next/server";

const mockChannels = {
  general: {
    id: "1",
    name: "general",
    isPrivate: false,
    description: "General discussion channel",
    memberCount: 42,
    topic:
      "Welcome to the general channel! Feel free to discuss anything here.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  random: {
    id: "2",
    name: "random",
    isPrivate: false,
    description: "Random conversations",
    memberCount: 38,
    topic: "Random thoughts, fun discussions, and off-topic chatter.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  "dev-team": {
    id: "3",
    name: "dev-team",
    isPrivate: true,
    description: "Development team discussions",
    memberCount: 12,
    topic: "Development discussions, code reviews, and technical planning.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  design: {
    id: "4",
    name: "design",
    isPrivate: false,
    description: "Design discussions and feedback",
    memberCount: 18,
    topic: "Design reviews, feedback, and creative collaboration.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  marketing: {
    id: "5",
    name: "marketing",
    isPrivate: true,
    description: "Marketing team coordination",
    memberCount: 8,
    topic: "Marketing campaigns, strategies, and team coordination.",
    createdAt: "2024-01-01T00:00:00Z",
  },
};

export async function GET(request, { params }) {
  const { channelName } = await params;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const channel = mockChannels[channelName];

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  return NextResponse.json({
    channel,
    timestamp: new Date().toISOString(),
  });
}
