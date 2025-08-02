"use client";

import Link from "next/link";
import { useState, useEffect, use, act } from "react";
import { useParams, useRouter } from "next/navigation";
import { Suspense } from "react";

import { mockApi } from "./lib";

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

// Hook to get current prefetch state
export function usePrefetchState() {
  const [prefetchEnabled, setPrefetchEnabled] = useState(() => {
    const prefetchCookie = getCookie("prefetch");
    return prefetchCookie !== "false";
  });

  useEffect(() => {
    const checkCookie = () => {
      const prefetchCookie = getCookie("prefetch");
      setPrefetchEnabled(prefetchCookie !== "false");
    };

    checkCookie();
    const interval = setInterval(checkCookie, 100);

    return () => clearInterval(interval);
  }, []);

  return prefetchEnabled;
}

// Create a cache for promises to avoid re-fetching on re-renders
const messageCache = new Map();

function fetchMessages(cacheKey) {
  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey);
  }

  const channelId = cacheKey.split(":")[0];
  const promise = mockApi.getMessages(channelId);
  messageCache.set(cacheKey, promise);
  return promise;
}

// Message List Component using React use hook
export function MessageList({ channelId }) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleMessagesUpdate = (event) => {
      if (event.detail.channelId === channelId) {
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("messagesSent", handleMessagesUpdate);
    return () =>
      window.removeEventListener("messagesSent", handleMessagesUpdate);
  }, [channelId]);

  const messages = use(fetchMessages(channelId + ":" + refreshKey));

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-sm font-semibold text-white">
            {message.user
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="font-semibold">{message.user}</span>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-800 mt-1">{message.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Message Input Component
export function MessageInput({ channelId, user = "John Doe" }) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() && channelId) {
      setIsLoading(true);
      try {
        await mockApi.sendMessage(channelId, message.trim());
        // Clear relevant cache entries
        for (const key of messageCache.keys()) {
          if (key.startsWith(channelId + ":")) {
            messageCache.delete(key);
          }
        }
        setMessage("");
        // Trigger a re-render by forcing a state update
        window.dispatchEvent(
          new CustomEvent("messagesSent", { detail: { channelId } })
        );
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// Message List Skeleton Component
export function MessageListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-3 bg-gray-100 rounded animate-pulse"></div>
            </div>
            <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Prefetch Toggle Component
export function PrefetchToggle() {
  const [prefetchEnabled, setPrefetchEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefetchCookie = getCookie("prefetch");
    setPrefetchEnabled(prefetchCookie !== "false");
  }, []);

  const togglePrefetch = () => {
    const newPrefetchState = !prefetchEnabled;
    setPrefetchEnabled(newPrefetchState);

    if (newPrefetchState) {
      setCookie("prefetch", "true");
    } else {
      setCookie("prefetch", "false");
    }
  };

  if (!mounted) {
    return (
      <div className="px-4 py-2 border-t border-gray-700">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
          <span>Runtime Prefetch: Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 border-t border-gray-700">
      <button
        onClick={togglePrefetch}
        className="flex items-center space-x-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
        title={`Prefetching is ${prefetchEnabled ? "enabled" : "disabled"}`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            prefetchEnabled ? "bg-green-500" : "bg-red-500"
          }`}
        ></span>
        <span>Runtime Prefetch: {prefetchEnabled ? "ON" : "OFF"}</span>
      </button>
    </div>
  );
}

// Prefetch Debugger Component
export function PrefetchDebugger() {
  const [logs, setLogs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const originalPrefetch = router.prefetch;
    router.prefetch = function (...args) {
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev.slice(-9),
        `${timestamp}: Prefetching ${args[0]}`,
      ]);
      return originalPrefetch.apply(this, args);
    };

    return () => {
      router.prefetch = originalPrefetch;
    };
  }, [router]);

  if (logs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white text-xs p-2 rounded max-w-xs max-h-32 overflow-y-auto">
      <div className="font-bold mb-1">Prefetch Debug:</div>
      {logs.map((log, i) => (
        <div key={i}>{log}</div>
      ))}
    </div>
  );
}

// Channel List Component
export function ChannelList({ channels }) {
  const prefetchEnabled = usePrefetchState();

  const { channelId: activeChannelId } = useParams();
  console.log(prefetchEnabled, "prefetchEnabled");
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-2 px-4">
        Channels
      </h3>
      <ul className="space-y-1">
        {channels?.map((channel) => (
          <li key={channel.id}>
            <Link
              href={`/channel/${channel.id}`}
              prefetch={prefetchEnabled ? true : undefined}
              className={`block w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeChannelId?.[0] === channel.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
              title={`${channel.description} ${
                prefetchEnabled ? "(Prefetch: ON)" : "(Prefetch: OFF)"
              }`}
            >
              <span className="mr-2">{channel.isPrivate ? "🔒" : "#"}</span>
              {channel.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Channel List Skeleton
function ChannelListSkeleton() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-2 px-4">
        Channels
      </h3>
      <ul className="space-y-1">
        {[1, 2, 3].map((i) => (
          <li key={i}>
            <div className="px-4 py-2 text-gray-400">
              <div className="animate-pulse flex items-center">
                <span className="mr-2">#</span>
                <div className="h-4 bg-gray-600 rounded w-20"></div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Sidebar Component
export function Sidebar({ channels }) {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Slack Clone</h1>
        <p className="text-sm text-gray-400">workspace.slack.com</p>
      </div>

      <div className="flex-1 p-2">
        <Suspense fallback={<ChannelListSkeleton />}>
          <ChannelList channels={channels} />
        </Suspense>
      </div>

      <PrefetchToggle />

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-sm font-semibold">
            JD
          </div>
          <div>
            <div className="text-sm font-medium">John Doe</div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
