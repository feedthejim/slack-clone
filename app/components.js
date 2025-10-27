"use client";

import Link from "next/link";
import { useState, useOptimistic, useTransition } from "react";
import { useParams } from "next/navigation";
import {
  useMessages,
  useSendMessage,
  useChannels,
  useGlobalMessageInjection,
  useChannelNewMessages,
  markChannelAsVisitedAction,
  useRecentMessages,
  useCurrentUser,
} from "./hooks";
import { logoutAction } from "./actions";

// Message List Component using React Query with Optimistic Updates
export function MessageList({ channelId, optimisticMessages }) {
  const { data: messages = [] } = useMessages(channelId);
  
  // Combine server messages with optimistic messages
  const allMessages = [...messages, ...optimisticMessages];

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-end min-h-0">
      <div className="space-y-6 min-h-full flex flex-col justify-end">
        {allMessages.map((message) => (
          <div key={message.id} className="flex space-x-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-sm font-medium text-white">
              {message.user
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="font-medium text-black">{message.user}</span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p
                className={`leading-relaxed ${
                  message.isPending ? "text-gray-500" : "text-gray-900"
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Message Container Component with Optimistic Updates
export function MessageContainer({ channelId }) {
  const currentUser = useCurrentUser();
  const sendMessageMutation = useSendMessage(channelId);
  const [isPending, startTransition] = useTransition();
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    [],
    (state, newMessage) => [...state, newMessage]
  );

  const sendMessage = async (text) => {
    const optimisticMessage = {
      id: `optimistic-${Date.now()}`,
      text,
      user: currentUser.name,
      timestamp: new Date().toISOString(),
      isPending: true,
    };

    startTransition(async () => {
      addOptimisticMessage(optimisticMessage);
      
      try {
        await sendMessageMutation.mutateAsync(text);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <MessageList channelId={channelId} optimisticMessages={optimisticMessages} />
      <MessageInput channelId={channelId} onSendMessage={sendMessage} isPending={isPending} />
    </div>
  );
}

// Message Input Component
export function MessageInput({ channelId, onSendMessage, isPending }) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() && channelId) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="p-6 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors text-sm"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={!message.trim() || isPending}
          className="px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {isPending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

// Message List Skeleton Component
export function MessageListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-end">
      <div className="space-y-6 min-h-full flex flex-col justify-end">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-3 bg-gray-150 rounded animate-pulse"></div>
              </div>
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
              {i % 3 === 0 && (
                <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Message Container Skeleton Component
export function MessageContainerSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <MessageListSkeleton />
      <div className="border-t border-gray-200 p-6">
        <div className="flex space-x-3">
          <div className="flex-1">
            <div className="w-full h-12 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="w-16 h-12 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Channel List Component with ordering by latest messages
export function ChannelList() {
  const { data: channels = [] } = useChannels();
  const { channelId: activeChannelId } = useParams();
  const recentMessages = useRecentMessages();

  // Get latest message timestamp for each channel
  const getChannelLastActivity = (channelId) => {
    const channelMessage = recentMessages.find(
      (msg) => msg.channelId === channelId
    );
    return channelMessage ? new Date(channelMessage.timestamp).getTime() : 0;
  };

  // Sort channels by latest activity
  const sortedChannels = [...channels].sort((a, b) => {
    const aActivity = getChannelLastActivity(a.id);
    const bActivity = getChannelLastActivity(b.id);
    return bActivity - aActivity; // Most recent first
  });

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 px-4">
        Channels
      </h3>
      <ul className="space-y-1">
        {sortedChannels?.map((channel) => (
          <li key={channel.id}>
            <ChannelLink
              channel={channel}
              isActive={activeChannelId?.[0] === channel.id}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Individual Channel Link Component
function ChannelLink({ channel, isActive }) {
  const hasNewMessages = useChannelNewMessages(channel.id);

  const handleClick = () => {
    // Mark channel as read when clicked
    markChannelAsVisitedAction(channel.id);
  };

  return (
    <Link
      href={`/channel/${channel.id}`}
      onClick={handleClick}
      className={`block w-full text-left px-4 py-2.5 rounded-md transition-colors text-sm font-medium relative ${
        isActive ? "bg-black text-white" : "text-gray-900 hover:bg-gray-100"
      }`}
      title={channel.description}
    >
      <span className="mr-2 text-gray-600">
        {channel.isPrivate ? "🔒" : "#"}
      </span>
      {channel.name}
      {hasNewMessages && !isActive && (
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"></span>
      )}
    </Link>
  );
}

// Logout Form Component using Server Action
function LogoutForm() {
  return (
    <form action={logoutAction} className="inline">
      <button
        type="submit"
        className="text-xs text-gray-500 hover:text-black transition-colors p-1 rounded"
        title="Sign out"
      >
        ↗
      </button>
    </form>
  );
}

// Sidebar Component - now only renders dynamic content
export function Sidebar({ user }) {
  return (
    <div className="flex-1 p-2 min-h-0 overflow-y-auto">
      <ChannelList />
    </div>
  );
}
