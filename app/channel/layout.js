import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ClientWrapper } from "../providers";
import { Sidebar } from "../components";
import { getQueryClient } from "../get-query-client";
import { mockApi } from "../lib";
import { requireAuth } from "../auth";
import { logoutAction } from "../actions";
import { MessageInjectionStarter } from "../message-injection-starter";
import { MessageProgressIndicator, RecentMessages } from "../sidebar-dynamic-sections";

// Channels skeleton component
function ChannelsSkeleton() {
  return (
    <div className="flex-1 p-2">
      <div className="animate-pulse">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 px-4">
          Channels
        </h3>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-2.5 mb-1">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Split sidebar with static parts shown immediately
function SidebarShell({ children, user, startMessageInjection = false }) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-black">Chat</h1>
        <p className="text-sm text-gray-500">workspace.vercel.app</p>
      </div>

      {children}

      {/* Dynamic client-side sections */}
      <MessageProgressIndicator />
      <RecentMessages />

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

      <div className="p-4 border-t border-gray-200">
        {user ? (
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
            <form action={logoutAction} className="inline">
              <button
                type="submit"
                className="text-xs text-gray-500 hover:text-black transition-colors p-1 rounded"
                title="Sign out"
              >
                ↗
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-12"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

async function SidebarWithData() {
  const queryClient = getQueryClient();
  const user = await requireAuth();

  // Prefetch channels data - no await needed
  queryClient.prefetchQuery({
    queryKey: ["channels"],
    queryFn: mockApi.getChannels,
  });

  return (
    <SidebarShell user={user}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Sidebar user={user} />
      </HydrationBoundary>
    </SidebarShell>
  );
}

export default function ChannelLayout({ children }) {
  return (
    <ClientWrapper>
      <MessageInjectionStarter />
      <div className="flex h-screen">
        <Suspense fallback={
          <SidebarShell user={null}>
            <ChannelsSkeleton />
          </SidebarShell>
        }>
          <SidebarWithData />
        </Suspense>
        <div className="flex-1">{children}</div>
      </div>
    </ClientWrapper>
  );
}
