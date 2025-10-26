import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ClientWrapper } from "../providers";
import { Sidebar } from "../components";
import { getQueryClient } from "../get-query-client";
import { mockApi } from "../lib";
import { requireAuth } from "../auth";

function SidebarSkeleton() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-black">Chat</h1>
        <p className="text-sm text-gray-500">workspace.vercel.app</p>
      </div>
      <div className="flex-1 p-2">
        <div className="animate-pulse">
          <h3 className="text-sm font-medium text-gray-600 mb-3 px-4">
            Channels
          </h3>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 py-2.5 mb-1">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-100 rounded w-12 animate-pulse"></div>
          </div>
        </div>
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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Sidebar user={user} />
    </HydrationBoundary>
  );
}

export default function ChannelLayout({ children }) {
  return (
    <ClientWrapper>
      <div className="flex h-screen">
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarWithData />
        </Suspense>
        <div className="flex-1">{children}</div>
      </div>
    </ClientWrapper>
  );
}
