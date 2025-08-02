import { NextResponse } from "next/server";

const mockChannelsById = {
  "1": {
    id: "1",
    name: "general",
    isPrivate: false,
    description: "General discussion channel",
    memberCount: 42,
    topic: "Welcome to the general channel! Feel free to discuss anything here.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  "2": {
    id: "2",
    name: "random",
    isPrivate: false,
    description: "Random conversations",
    memberCount: 38,
    topic: "Random thoughts, fun discussions, and off-topic chatter.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  "3": {
    id: "3",
    name: "dev-team",
    isPrivate: true,
    description: "Development team discussions",
    memberCount: 12,
    topic: "Development discussions, code reviews, and technical planning.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  "4": {
    id: "4",
    name: "design",
    isPrivate: false,
    description: "Design discussions and feedback",
    memberCount: 18,
    topic: "Design reviews, feedback, and creative collaboration.",
    createdAt: "2024-01-01T00:00:00Z",
  },
  "5": {
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
  const { channelId } = await params;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const channel = mockChannelsById[channelId];

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  return NextResponse.json({
    channel,
    timestamp: new Date().toISOString(),
  });
}