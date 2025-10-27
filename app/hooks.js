"use client";

import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { mockApi } from "./lib";

// Query keys
export const queryKeys = {
  channels: ["channels"],
  messages: (channelId) => ["messages", channelId],
};

// Channels query
export function useChannels() {
  return useSuspenseQuery({
    queryKey: queryKeys.channels,
    queryFn: mockApi.getChannels,
  });
}

// Current user hook
export function useCurrentUser() {
  return {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
  };
}

// Messages query
export function useMessages(channelId) {
  const queryClient = useQueryClient();

  return useSuspenseQuery({
    queryKey: queryKeys.messages(channelId),
    queryFn: () => mockApi.getMessages(channelId),
    select: (data) => {
      // When server data loads, merge with any pending injected messages
      const pending = pendingInjectedMessages.get(channelId) || [];
      if (pending.length > 0) {
        pendingInjectedMessages.delete(channelId); // Clear pending since we're merging

        const allMessages = [...data, ...pending];
        const uniqueMessages = allMessages.filter(
          (msg, index, arr) => arr.findIndex((m) => m.id === msg.id) === index
        );

        return uniqueMessages.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }
      return data;
    },
  });
}

// Fake message generation data
const fakeUsers = [
  "Alex Turner",
  "Emma Watson",
  "Ryan Gosling",
  "Sophie Chen",
  "Marcus Johnson",
  "Lisa Park",
  "David Kim",
  "Rachel Green",
  "Chris Evans",
  "Maya Patel",
  "Jordan Smith",
  "Nina Rodriguez",
];

const fakeMessages = [
  "Anyone up for lunch today?",
  "Great work on the presentation!",
  "Just finished the quarterly review",
  "The new design looks fantastic",
  "Has anyone seen the latest analytics?",
  "Coffee break in 10 minutes?",
  "I love the new feature we shipped",
  "The client meeting went really well",
  "Working on the bug fixes now",
  "The team sync was productive",
  "Just deployed the hotfix",
  "Thanks for the quick turnaround",
  "The performance improvements are noticeable",
  "Great job everyone!",
  "Weekend plans anyone?",
  "The documentation is very helpful",
  "Just merged the PR",
  "The tests are all passing now",
  "Really excited about this project",
  "The user feedback has been positive",
];

// Generate a realistic fake message
function generateFakeMessage(channelId) {
  const user = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
  const text = fakeMessages[Math.floor(Math.random() * fakeMessages.length)];

  return {
    id: `fake-${Date.now()}-${Math.random()}`,
    text,
    user,
    timestamp: new Date().toISOString(),
  };
}

// Global state for recent messages across all channels
let recentMessagesGlobal = [];
const recentMessagesSubscribers = new Set();

// Global state for visited channels (to track read status)
// Store channel visit timestamps instead of just boolean
let visitedChannelsGlobal = new Map(); // channelId -> timestamp
const visitedChannelsSubscribers = new Set();

// Global state for message injection progress
let injectionProgressGlobal = {
  progress: 0,
  nextMessageIn: 0,
  isActive: false,
};
const progressSubscribers = new Set();

// Global message injection state
let globalInjectionTimer = null;
let globalProgressTimer = null;
let isGlobalInjectionActive = false;
const availableChannels = ["1", "2", "3", "4", "5"];

// Store injected messages before server data loads to prevent race conditions
const pendingInjectedMessages = new Map(); // channelId -> Message[]

// Unified function to safely add messages to cache with race condition handling
function safelyAddMessageToCache(queryClient, channelId, newMessage) {
  queryClient.setQueryData(queryKeys.messages(channelId), (old) => {
    // If no server data yet, just store in pending - don't return anything
    // This allows prefetchQuery to still run and fetch server data
    if (!old) {
      if (!pendingInjectedMessages.has(channelId)) {
        pendingInjectedMessages.set(channelId, []);
      }
      pendingInjectedMessages.get(channelId).push(newMessage);
      return old; // Return undefined to keep cache empty
    }

    // If we have server data, merge any pending messages and add the new one
    const pending = pendingInjectedMessages.get(channelId) || [];
    pendingInjectedMessages.delete(channelId); // Clear pending since we're merging

    // Combine server data + pending + new message, sort by timestamp, remove duplicates
    const allMessages = [...old, ...pending, newMessage];
    const uniqueMessages = allMessages.filter(
      (msg, index, arr) => arr.findIndex((m) => m.id === msg.id) === index
    );

    return uniqueMessages.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });
}

// Subscribe to recent messages updates
function subscribeToRecentMessages(callback) {
  recentMessagesSubscribers.add(callback);
  return () => recentMessagesSubscribers.delete(callback);
}

// Subscribe to visited channels updates
function subscribeToVisitedChannels(callback) {
  visitedChannelsSubscribers.add(callback);
  return () => visitedChannelsSubscribers.delete(callback);
}

// Mark channel as visited (clears unread status)
function markChannelAsVisited(channelId) {
  visitedChannelsGlobal.set(channelId, Date.now());
  visitedChannelsSubscribers.forEach((callback) =>
    callback(new Map(visitedChannelsGlobal))
  );
}

// Subscribe to progress updates
function subscribeToProgress(callback) {
  progressSubscribers.add(callback);
  return () => progressSubscribers.delete(callback);
}

// Update progress and notify subscribers
function updateProgress(progress, nextMessageIn, isActive) {
  injectionProgressGlobal = { progress, nextMessageIn, isActive };
  progressSubscribers.forEach((callback) =>
    callback({ ...injectionProgressGlobal })
  );
}

// Add message to recent messages and notify subscribers
function addToRecentMessages(message, channelId) {
  const messageWithChannel = { ...message, channelId };
  recentMessagesGlobal = [messageWithChannel, ...recentMessagesGlobal]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10); // Keep only latest 10 messages

  recentMessagesSubscribers.forEach((callback) =>
    callback([...recentMessagesGlobal])
  );
}

// Hook to get recent messages across all channels
export function useRecentMessages() {
  const [recentMessages, setRecentMessages] = useState(recentMessagesGlobal);

  useEffect(() => {
    const unsubscribe = subscribeToRecentMessages(setRecentMessages);
    return unsubscribe;
  }, []);

  return recentMessages;
}

// Hook to track visited channels
export function useVisitedChannels() {
  const [visitedChannels, setVisitedChannels] = useState(visitedChannelsGlobal);

  useEffect(() => {
    const unsubscribe = subscribeToVisitedChannels(setVisitedChannels);
    return unsubscribe;
  }, []);

  return visitedChannels;
}

// Function to mark channel as visited (for use in click handlers)
export function markChannelAsVisitedAction(channelId) {
  markChannelAsVisited(channelId);
}

// Hook to check if channel has new messages since last visit
export function useChannelNewMessages(channelId) {
  const recentMessages = useRecentMessages();
  const visitedChannels = useVisitedChannels();
  const { channelId: currentChannelId } = useParams();

  // Don't show indicator for current channel
  if (currentChannelId === channelId) {
    return false;
  }

  // Check if this channel has messages in recent messages
  const channelMessages = recentMessages.filter(
    (msg) => msg.channelId === channelId
  );
  if (channelMessages.length === 0) {
    return false;
  }

  // If channel has never been visited, show indicator
  if (!visitedChannels.has(channelId)) {
    return true;
  }

  // If channel has been visited, check if there are messages newer than the visit time
  const lastVisitTime = visitedChannels.get(channelId);
  const hasNewerMessages = channelMessages.some(
    (msg) => new Date(msg.timestamp).getTime() > lastVisitTime
  );

  return hasNewerMessages;
}

// Hook to get message injection progress
export function useMessageProgress() {
  const [progress, setProgress] = useState(injectionProgressGlobal);

  useEffect(() => {
    const unsubscribe = subscribeToProgress(setProgress);
    return unsubscribe;
  }, []);

  return progress;
}

// Start global message injection that works across all channels
function startGlobalMessageInjection(queryClient) {
  if (isGlobalInjectionActive) return;

  isGlobalInjectionActive = true;

  const injectMessage = () => {
    // Pick a random channel
    const randomChannelId =
      availableChannels[Math.floor(Math.random() * availableChannels.length)];
    const fakeMessage = generateFakeMessage(randomChannelId);

    // Use unified function to safely add message to cache
    safelyAddMessageToCache(queryClient, randomChannelId, fakeMessage);

    // Add to recent messages global state
    addToRecentMessages(fakeMessage, randomChannelId);
  };

  // Start injecting messages at random intervals between 5-10 seconds
  const startInjection = () => {
    const randomInterval = Math.random() * 10000 + 5000; // 5-10 seconds
    const startTime = Date.now();

    updateProgress(0, Math.round(randomInterval / 1000), true);

    // Update progress every 100ms
    const updateProgressInterval = () => {
      globalProgressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / randomInterval) * 100, 100);
        const remaining = Math.max(
          Math.round((randomInterval - elapsed) / 1000),
          0
        );

        updateProgress(progress, remaining, true);

        if (progress >= 100) {
          clearInterval(globalProgressTimer);
        }
      }, 100);
    };

    updateProgressInterval();

    globalInjectionTimer = setTimeout(() => {
      injectMessage();
      if (globalProgressTimer) {
        clearInterval(globalProgressTimer);
      }
      startInjection(); // Schedule next injection
    }, randomInterval);
  };

  // Start the injection cycle
  startInjection();
}

// Stop global message injection
function stopGlobalMessageInjection() {
  isGlobalInjectionActive = false;

  if (globalInjectionTimer) {
    clearTimeout(globalInjectionTimer);
    globalInjectionTimer = null;
  }

  if (globalProgressTimer) {
    clearInterval(globalProgressTimer);
    globalProgressTimer = null;
  }

  updateProgress(0, 0, false);
}

// Hook to start/stop global message injection
export function useGlobalMessageInjection(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (enabled) {
      startGlobalMessageInjection(queryClient);
    } else {
      stopGlobalMessageInjection();
    }

    return () => {
      // Don't stop on unmount to persist across navigation
      // Only stop when explicitly disabled
    };
  }, [enabled, queryClient]);
}

// Send message mutation
export function useSendMessage(channelId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message) => mockApi.sendMessage(channelId, message),
    onSuccess: (newMessage) => {
      // Use unified function to safely add message to cache
      safelyAddMessageToCache(queryClient, channelId, newMessage);

      // Add to recent messages global state
      addToRecentMessages(newMessage, channelId);
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
    },
  });
}
