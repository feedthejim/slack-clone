"use client";

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });
}