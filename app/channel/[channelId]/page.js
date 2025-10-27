import { redirect } from "next/navigation";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getChannelById } from "../../server-lib";
import { getQueryClient } from "../../get-query-client";
import { mockApi } from "../../lib";
import {
  MessageList,
  MessageInput,
  MessageListSkeleton,
} from "../../components";

const validChannelIds = ["1", "2", "3", "4", "5"];

function ChannelHeaderSkeleton() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-80 h-4 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

function MessageInputSkeleton() {
  return (
    <div className="border-t border-gray-200 p-6">
      <div className="flex space-x-3">
        <div className="flex-1">
          <div className="w-full h-12 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="w-16 h-12 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    </div>
  );
}

export default function ChannelPage({ params }) {
  return <ChatInterface params={params} />;
}

// Channel Header Component with params validation
async function ChannelHeaderWithParams({ params }) {
  const { channelId } = await params;

  if (!validChannelIds.includes(channelId)) {
    redirect("/channel/1");
  }

  return <ChannelHeader channelId={channelId} />;
}

// Channel Header Component
async function ChannelHeader({ channelId }) {
  "use cache";
  const channel = await getChannelById(channelId);

  if (!channel) {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="text-gray-600">Channel not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-black flex items-center">
            <span className="mr-3 text-gray-500">
              {channel.isPrivate ? "🔒" : "#"}
            </span>
            {channel.name}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {channel.topic || channel.description}
          </p>
        </div>
        <div className="text-sm text-gray-500 font-medium">
          {channel.memberCount} members
        </div>
      </div>
    </div>
  );
}

// Chat Interface Component with separate Suspense boundaries
function ChatInterface({ params }) {
  return (
    <div className="flex-1 flex flex-col bg-white h-screen">
      <Suspense fallback={<ChannelHeaderSkeleton />}>
        <ChannelHeaderWithParams params={params} />
      </Suspense>

      <div className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={<MessageListSkeleton />}>
          <MessageListWithParams params={params} />
        </Suspense>
      </div>

      <Suspense fallback={<MessageInputSkeleton />}>
        <MessageInputWithParams params={params} />
      </Suspense>
    </div>
  );
}

// Messages component wrapper that handles params
async function MessageListWithParams({ params }) {
  const { channelId } = await params;

  if (!validChannelIds.includes(channelId)) {
    redirect("/channel/1");
  }

  return <MessageListWithData channelId={channelId} />;
}

// Messages component that prefetches and reads user data
async function MessageListWithData({ channelId }) {
  "use cache";
  const queryClient = getQueryClient();

  // Prefetch messages data - no await needed
  queryClient.prefetchQuery({
    queryKey: ["messages", channelId],
    queryFn: () => mockApi.getMessages(channelId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MessageList channelId={channelId} />
    </HydrationBoundary>
  );
}

// Message input component wrapper that handles params
async function MessageInputWithParams({ params }) {
  const { channelId } = await params;

  if (!validChannelIds.includes(channelId)) {
    redirect("/channel/1");
  }

  return <MessageInputWithData channelId={channelId} />;
}

// Message input component that reads user data
async function MessageInputWithData({ channelId }) {
  return <MessageInput channelId={channelId} />;
}

export async function generateStaticParams() {
  return validChannelIds.map((channelId) => ({ channelId }));
}

