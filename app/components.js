"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useMessages, useSendMessage, useChannels, useGlobalMessageInjection, useRecentMessages, useMessageProgress, useChannelNewMessages } from "./hooks";
import { logoutAction } from "./actions";


// Message List Component using React Query
export function MessageList({ channelId }) {
  const { data: messages = [] } = useMessages(channelId);

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-end">
      <div className="space-y-6 min-h-full flex flex-col justify-end">
        {messages.map((message) => (
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
              <p className="text-gray-900 leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Message Input Component
export function MessageInput({ channelId }) {
  const [message, setMessage] = useState("");
  const sendMessageMutation = useSendMessage(channelId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() && channelId) {
      try {
        await sendMessageMutation.mutateAsync(message.trim());
        setMessage("");
      } catch (error) {
        // Error is handled by the mutation
      }
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
          disabled={sendMessageMutation.isPending}
        />
        <button
          type="submit"
          disabled={!message.trim() || sendMessageMutation.isPending}
          className="px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {sendMessageMutation.isPending ? "Sending..." : "Send"}
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



// Channel List Component with ordering by latest messages
export function ChannelList() {
  const { data: channels = [] } = useChannels();
  const { channelId: activeChannelId } = useParams();
  const recentMessages = useRecentMessages();

  // Get latest message timestamp for each channel
  const getChannelLastActivity = (channelId) => {
    const channelMessage = recentMessages.find(msg => msg.channelId === channelId);
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
  
  return (
    <Link
      href={`/channel/${channel.id}`}
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

// Logout Button Component
function LogoutButton({ user }) {
  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-sm font-medium text-white">
            {user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-black">
              {user?.name || "User"}
            </div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
        </div>
        <LogoutForm />
      </div>
    </div>
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

// Message Progress Indicator Component
function MessageProgressIndicator() {
  const progress = useMessageProgress();

  if (!progress.isActive) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-900">Next Message</h4>
        <span className="text-xs text-gray-600">{progress.nextMessageIn}s</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-green-500 h-1.5 rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${progress.progress}%` }}
        />
      </div>
    </div>
  );
}

// Recent Messages Component
function RecentMessages() {
  const recentMessages = useRecentMessages();
  const { data: channels = [] } = useChannels();
  
  const getChannelName = (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    return channel ? channel.name : `channel-${channelId}`;
  };

  if (recentMessages.length === 0) {
    return (
      <div className="px-4 py-3 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-900 mb-2">Recent Messages</h4>
        <div className="text-xs text-gray-500">No recent messages</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <h4 className="text-xs font-semibold text-gray-900 mb-3">Recent Messages</h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {recentMessages.slice(0, 5).map((message) => (
          <div key={`${message.id}-${message.channelId}`} className="text-xs">
            <div className="flex items-center space-x-1 mb-1">
              <span className="font-medium text-gray-900 truncate max-w-20">
                {message.user.split(' ')[0]}
              </span>
              <span className="text-gray-500">in</span>
              <span className="text-gray-700 font-medium">
                #{getChannelName(message.channelId)}
              </span>
            </div>
            <div className="text-gray-600 line-clamp-2 leading-relaxed">
              {message.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Demo Disclaimer Component
function DemoDisclaimer() {
  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="text-xs text-gray-600 bg-gray-50 rounded-md p-2">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-blue-500">ⓘ</span>
          <span className="font-medium text-gray-700">Architecture Overview</span>
        </div>
        <p className="text-gray-600 leading-relaxed mb-2">
          This demo showcases <strong>PPR</strong> with Cache Components and{" "}
          <strong>hybrid data architecture</strong>. Initial data (channels, messages, user)
          is seeded by <strong>Server Components</strong> using <code>prefetchQuery</code>,
          then hydrated to <strong>TanStack Query</strong> for client-side state management.
        </p>
        <p className="text-gray-600 leading-relaxed">
          <strong>Real-time simulation</strong> injects messages every 5-15 seconds,
          updating React Query cache directly for instant UI updates and optimistic UX.
          This combines server-side performance with client-side reactivity.
        </p>
      </div>
    </div>
  );
}

// Sidebar Component - now only renders dynamic content
export function Sidebar({ user }) {
  return (
    <div className="flex-1 p-2">
      <ChannelList />
    </div>
  );
}
