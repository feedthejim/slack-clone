"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMessages, useSendMessage, useChannels } from "./hooks";
import { logoutAction } from "./actions";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";

// Cookie utilities
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function setCookie(name, value, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// Prefetch modes
const PREFETCH_MODES = {
  RUNTIME: "runtime",
  HOVER: "hover",
  OFF: "off",
};

// Hook to get current prefetch mode
export function usePrefetchMode() {
  const [prefetchMode, setPrefetchMode] = useState(() => {
    const prefetchCookie = getCookie("prefetch-mode");
    return prefetchCookie || PREFETCH_MODES.RUNTIME;
  });

  useEffect(() => {
    const checkCookie = () => {
      const prefetchCookie = getCookie("prefetch-mode");
      setPrefetchMode(prefetchCookie || PREFETCH_MODES.RUNTIME);
    };

    checkCookie();
    const interval = setInterval(checkCookie, 100);

    return () => clearInterval(interval);
  }, []);

  return prefetchMode;
}

// Backwards compatibility hook
export function usePrefetchState() {
  const mode = usePrefetchMode();
  return mode !== PREFETCH_MODES.OFF;
}

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
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
  );
}

// Performance Debug Component
export function PerformanceDebug() {
  const delays = [
    { name: "Channels List", time: "500ms", type: "sidebar" },
    { name: "Channel Header", time: "2s", type: "header" },
    { name: "Messages", time: "3s", type: "messages" },
    { name: "User Auth", time: "200ms", type: "input" },
    { name: "Send Message", time: "300ms", type: "action" },
  ];

  return (
    <div className="px-4 py-2 border-t border-gray-700">
      <h4 className="text-xs font-semibold text-gray-900 mb-3">API Delays</h4>
      <div className="space-y-2">
        {delays.map((delay) => (
          <div
            key={delay.name}
            className="flex justify-between items-center text-xs"
          >
            <span className="text-gray-900 truncate font-medium">
              {delay.name}
            </span>
            <div className="flex items-center space-x-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  delay.type === "sidebar"
                    ? "bg-green-500"
                    : delay.type === "header"
                    ? "bg-yellow-500"
                    : delay.type === "messages"
                    ? "bg-red-500"
                    : delay.type === "input"
                    ? "bg-blue-500"
                    : "bg-purple-500"
                }`}
              ></span>
              <span className="text-gray-900 font-mono font-semibold">
                {delay.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Prefetch Toggle Component
export function PrefetchToggle() {
  const [prefetchMode, setPrefetchMode] = useState(PREFETCH_MODES.RUNTIME);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefetchCookie = getCookie("prefetch-mode");
    setPrefetchMode(prefetchCookie || PREFETCH_MODES.RUNTIME);
  }, []);

  const selectMode = (mode) => {
    setPrefetchMode(mode);
    setCookie("prefetch-mode", mode);
    setIsOpen(false);
  };

  const getModeDisplay = (mode) => {
    switch (mode) {
      case PREFETCH_MODES.RUNTIME:
        return {
          text: "Runtime",
          color: "bg-green-500",
          description: "Immediate prefetch",
        };
      case PREFETCH_MODES.HOVER:
        return {
          text: "On Hover",
          color: "bg-yellow-500",
          description: "Prefetch on mouse hover",
        };
      case PREFETCH_MODES.OFF:
        return {
          text: "Off",
          color: "bg-red-500",
          description: "No prefetching",
        };
      default:
        return {
          text: "Runtime",
          color: "bg-green-500",
          description: "Immediate prefetch",
        };
    }
  };

  if (!mounted) {
    return (
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-700">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          <span className="font-medium">Prefetch Messages: Loading...</span>
        </div>
      </div>
    );
  }

  const currentMode = getModeDisplay(prefetchMode);
  const allModes = Object.values(PREFETCH_MODES).map((mode) => ({
    value: mode,
    ...getModeDisplay(mode),
  }));

  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="text-xs font-medium text-gray-700 mb-2">
        Prefetch Messages
      </div>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md text-xs hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${currentMode.color}`}
            ></span>
            <span className="font-medium text-gray-900">
              {currentMode.text}
            </span>
          </div>
          <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
            {allModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => selectMode(mode.value)}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors first:rounded-t-md last:rounded-b-md ${
                  mode.value === prefetchMode ? "bg-gray-100" : ""
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${mode.color}`}
                ></span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{mode.text}</div>
                  <div className="text-gray-600 text-xs">
                    {mode.description}
                  </div>
                </div>
                {mode.value === prefetchMode && (
                  <span className="text-green-600 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Channel List Component
export function ChannelList() {
  const prefetchMode = usePrefetchMode();
  const { data: channels = [] } = useChannels();
  const { channelId: activeChannelId } = useParams();

  const getModeDisplay = (mode) => {
    switch (mode) {
      case PREFETCH_MODES.RUNTIME:
        return "Runtime Prefetch";
      case PREFETCH_MODES.HOVER:
        return "Hover Prefetch";
      case PREFETCH_MODES.OFF:
        return "No Prefetch";
      default:
        return "Runtime Prefetch";
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 px-4">
        Channels
      </h3>
      <ul className="space-y-1">
        {channels?.map((channel) => (
          <li key={channel.id}>
            <ChannelLink
              channel={channel}
              prefetchMode={prefetchMode}
              isActive={activeChannelId?.[0] === channel.id}
              getModeDisplay={getModeDisplay}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Individual Channel Link Component with prefetch handling
function ChannelLink({ channel, prefetchMode, isActive, getModeDisplay }) {
  const router = useRouter();
  const [isPrefetched, setIsPrefetched] = useState(false);

  const handleMouseEnter = () => {
    if (prefetchMode === PREFETCH_MODES.HOVER && !isPrefetched) {
      router.prefetch(`/channel/${channel.id}`);
      setIsPrefetched(true);
    }
  };

  const getPrefetchProps = () => {
    switch (prefetchMode) {
      case PREFETCH_MODES.RUNTIME:
        return { prefetch: true };
      case PREFETCH_MODES.HOVER:
      case PREFETCH_MODES.OFF:
      default:
        return {};
    }
  };

  return (
    <Link
      href={`/channel/${channel.id}`}
      {...getPrefetchProps()}
      onMouseEnter={handleMouseEnter}
      className={`block w-full text-left px-4 py-2.5 rounded-md transition-colors text-sm font-medium ${
        isActive ? "bg-black text-white" : "text-gray-900 hover:bg-gray-100"
      }`}
      title={`${channel.description} (${getModeDisplay(prefetchMode)})`}
    >
      <span className="mr-2 text-gray-600">
        {channel.isPrivate ? "🔒" : "#"}
      </span>
      {channel.name}
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

// Demo Disclaimer Component
function DemoDisclaimer() {
  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="text-xs text-gray-600 bg-gray-50 rounded-md p-2">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-blue-500">ⓘ</span>
          <span className="font-medium text-gray-700">Demo Info</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          This demo showcases <strong>PPR</strong> with Cache Components. Only{" "}
          <strong>chat messages</strong> are dynamic - other content is cached
          for optimal performance with partial prerendering. All data is fetched
          with <strong>Server Components</strong> preloading and <strong>TanStack Query</strong>.
        </p>
      </div>
    </div>
  );
}

// Sidebar Component
export function Sidebar({ user }) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-black">Chat</h1>
        <p className="text-sm text-gray-500">workspace.vercel.app</p>
      </div>

      <div className="flex-1 p-2">
        <ChannelList />
      </div>

      <DemoDisclaimer />
      <PerformanceDebug />
      <PrefetchToggle />
      <LogoutButton user={user} />
    </div>
  );
}
