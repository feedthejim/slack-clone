"use client";

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { mockApi } from './lib';

// Query keys
export const queryKeys = {
  channels: ['channels'],
  channel: (channelId) => ['channel', channelId],
  messages: (channelId) => ['messages', channelId],
  user: ['user'],
};

// Channels query
export function useChannels() {
  return useSuspenseQuery({
    queryKey: queryKeys.channels,
    queryFn: mockApi.getChannels,
  });
}

// Messages query
export function useMessages(channelId) {
  return useSuspenseQuery({
    queryKey: queryKeys.messages(channelId),
    queryFn: () => mockApi.getMessages(channelId),
  });
}

// User query
export function useCurrentUser() {
  return useSuspenseQuery({
    queryKey: queryKeys.user,
    queryFn: mockApi.getCurrentUser,
  });
}

// Fake message generation data
const fakeUsers = [
  'Alex Turner', 'Emma Watson', 'Ryan Gosling', 'Sophie Chen', 
  'Marcus Johnson', 'Lisa Park', 'David Kim', 'Rachel Green',
  'Chris Evans', 'Maya Patel', 'Jordan Smith', 'Nina Rodriguez'
];

const fakeMessages = [
  'Anyone up for lunch today?', 'Great work on the presentation!',
  'Just finished the quarterly review', 'The new design looks fantastic',
  'Has anyone seen the latest analytics?', 'Coffee break in 10 minutes?',
  'I love the new feature we shipped', 'The client meeting went really well',
  'Working on the bug fixes now', 'The team sync was productive',
  'Just deployed the hotfix', 'Thanks for the quick turnaround',
  'The performance improvements are noticeable', 'Great job everyone!',
  'Weekend plans anyone?', 'The documentation is very helpful',
  'Just merged the PR', 'The tests are all passing now',
  'Really excited about this project', 'The user feedback has been positive'
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
let visitedChannelsGlobal = new Set();
const visitedChannelsSubscribers = new Set();

// Global state for message injection progress
let injectionProgressGlobal = { progress: 0, nextMessageIn: 0, isActive: false };
const progressSubscribers = new Set();

// Global message injection state
let globalInjectionTimer = null;
let globalProgressTimer = null;
let isGlobalInjectionActive = false;
const availableChannels = ['1', '2', '3', '4', '5'];

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
  visitedChannelsGlobal.add(channelId);
  visitedChannelsSubscribers.forEach(callback => callback(new Set(visitedChannelsGlobal)));
}

// Subscribe to progress updates
function subscribeToProgress(callback) {
  progressSubscribers.add(callback);
  return () => progressSubscribers.delete(callback);
}

// Update progress and notify subscribers
function updateProgress(progress, nextMessageIn, isActive) {
  injectionProgressGlobal = { progress, nextMessageIn, isActive };
  progressSubscribers.forEach(callback => callback({ ...injectionProgressGlobal }));
}

// Add message to recent messages and notify subscribers
function addToRecentMessages(message, channelId) {
  const messageWithChannel = { ...message, channelId };
  recentMessagesGlobal = [messageWithChannel, ...recentMessagesGlobal]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10); // Keep only latest 10 messages
  
  recentMessagesSubscribers.forEach(callback => callback([...recentMessagesGlobal]));
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
  
  // Don't show indicator if channel has been visited and has no new messages since visit
  if (visitedChannels.has(channelId)) {
    // Find the most recent message for this channel
    const channelMessages = recentMessages.filter(msg => msg.channelId === channelId);
    if (channelMessages.length === 0) {
      return false;
    }
    
    // For now, we'll assume that once visited, the indicator is cleared
    // In a real app, you'd compare message timestamps with visit timestamps
    return false;
  }
  
  // Check if this channel has messages in recent messages
  const hasRecentMessage = recentMessages.some(msg => msg.channelId === channelId);
  return hasRecentMessage;
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
    const randomChannelId = availableChannels[Math.floor(Math.random() * availableChannels.length)];
    const fakeMessage = generateFakeMessage(randomChannelId);
    
    // Update the messages cache for the selected channel
    queryClient.setQueryData(queryKeys.messages(randomChannelId), (old) => {
      if (!old) return [fakeMessage];
      return [...old, fakeMessage];
    });
    
    // Add to recent messages global state
    addToRecentMessages(fakeMessage, randomChannelId);
  };

  // Start injecting messages at random intervals between 5-15 seconds
  const startInjection = () => {
    const randomInterval = Math.random() * 10000 + 5000; // 5-15 seconds
    const startTime = Date.now();
    
    updateProgress(0, Math.round(randomInterval / 1000), true);
    
    // Update progress every 100ms
    const updateProgressInterval = () => {
      globalProgressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / randomInterval) * 100, 100);
        const remaining = Math.max(Math.round((randomInterval - elapsed) / 1000), 0);
        
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

// Legacy hook for backward compatibility - now does nothing
export function useMessageInjection(channelId, enabled = true) {
  // This hook is now a no-op since injection happens globally
}

// Send message mutation
export function useSendMessage(channelId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message) => mockApi.sendMessage(channelId, message),
    onSuccess: (newMessage) => {
      // Update the messages cache
      queryClient.setQueryData(queryKeys.messages(channelId), (old) => {
        if (!old) return [newMessage];
        return [...old, newMessage];
      });
      
      // Add to recent messages global state
      addToRecentMessages(newMessage, channelId);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });
}