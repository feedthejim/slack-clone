import { NextResponse } from "next/server";

const mockMessages = {
  "1": [
    {
      id: "1",
      text: "Welcome to the general channel! This is where we discuss general topics.",
      user: "John Doe",
      timestamp: "2024-01-15T09:00:00Z",
      channelId: "1",
    },
    {
      id: "2",
      text: "Thanks for the warm welcome! Excited to be part of the team.",
      user: "Jane Smith",
      timestamp: "2024-01-15T09:15:00Z",
      channelId: "1",
    },
    {
      id: "3",
      text: "Don't forget about the team meeting at 2 PM today!",
      user: "Mike Johnson",
      timestamp: "2024-01-15T10:30:00Z",
      channelId: "1",
    },
  ],
  "2": [
    {
      id: "4",
      text: "Anyone seen the latest episode of that new show?",
      user: "Sarah Wilson",
      timestamp: "2024-01-15T11:00:00Z",
      channelId: "2",
    },
    {
      id: "5",
      text: "Yes! It was amazing. No spoilers though!",
      user: "Tom Brown",
      timestamp: "2024-01-15T11:05:00Z",
      channelId: "2",
    },
  ],
  "3": [
    {
      id: "6",
      text: "The new API endpoints are ready for testing.",
      user: "Alex Developer",
      timestamp: "2024-01-15T08:00:00Z",
      channelId: "3",
    },
    {
      id: "7",
      text: "Great! I'll run the integration tests this afternoon.",
      user: "Lisa Code",
      timestamp: "2024-01-15T08:30:00Z",
      channelId: "3",
    },
  ],
  "4": [
    {
      id: "8",
      text: "The new mockups look fantastic! Great work on the color scheme.",
      user: "Emma Designer",
      timestamp: "2024-01-15T14:00:00Z",
      channelId: "4",
    },
  ],
  "5": [
    {
      id: "9",
      text: "Q4 campaign performance exceeded expectations by 15%!",
      user: "Mark Marketing",
      timestamp: "2024-01-15T16:00:00Z",
      channelId: "5",
    },
  ],
};

export async function GET(request, { params }) {
  const { channelId } = await params;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const messages = mockMessages[channelId] || [];

  return NextResponse.json({
    messages,
    channelId,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request, { params }) {
  const { channelId } = await params;
  const { text, user } = await request.json();

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newMessage = {
    id: Date.now().toString(),
    text,
    user: user || "Anonymous",
    timestamp: new Date().toISOString(),
    channelId,
  };

  // Add message to mock storage
  if (!mockMessages[channelId]) {
    mockMessages[channelId] = [];
  }
  mockMessages[channelId].push(newMessage);

  return NextResponse.json({
    message: newMessage,
    success: true,
  });
}