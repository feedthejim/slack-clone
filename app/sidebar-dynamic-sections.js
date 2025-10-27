"use client";

import { useMessageProgress, useRecentMessages } from "./hooks";
import { useState, useEffect } from "react";

// Client-side progress indicator
export function MessageProgressIndicator() {
  const progress = useMessageProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show glimmer state until mounted
  if (!mounted) {
    return (
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-900">Next Message</h4>
          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-gray-300 h-1.5 rounded-full w-0" />
        </div>
      </div>
    );
  }

  if (!progress.isActive) {
    return (
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-900">Next Message</h4>
          <span className="text-xs text-gray-600">Starting...</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-gray-300 h-1.5 rounded-full w-0" />
        </div>
      </div>
    );
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

// Client-side recent messages  
export function RecentMessages() {
  const recentMessages = useRecentMessages();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show glimmer state until mounted
  if (!mounted) {
    return (
      <div className="px-4 py-3 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-900 mb-3">Recent Messages</h4>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-1 mb-1">
                <div className="w-12 h-3 bg-gray-200 rounded"></div>
                <div className="w-4 h-3 bg-gray-150 rounded"></div>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentMessages.length === 0) {
    return (
      <div className="px-4 py-3 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-900 mb-2">Recent Messages</h4>
        <div className="text-xs text-gray-500">No recent messages</div>
      </div>
    );
  }

  const getChannelName = (channelId) => {
    // Hardcoded channel names since we can't easily access useChannels here
    const channelNames = {
      '1': 'general',
      '2': 'random', 
      '3': 'dev-team',
      '4': 'design',
      '5': 'marketing'
    };
    return channelNames[channelId] || `channel-${channelId}`;
  };

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