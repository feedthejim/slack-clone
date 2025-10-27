import { redirect } from "next/navigation";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getChannelById } from "../../server-lib";
import { getQueryClient } from "../../get-query-client";
import { mockApi } from "../../lib";
import {
  MessageContainer,
  MessageContainerSkeleton,
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

// Channel Header Component
async function ChannelHeaderWithParams({ params }) {
  "use cache";
  const { channelId } = await params;

  if (!validChannelIds.includes(channelId)) {
    redirect("/channel/1");
  }

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

      <Suspense fallback={<MessageContainerSkeleton />}>
        <MessageContainerWithParams params={params} />
      </Suspense>
    </div>
  );
}

// Message container component that handles params and data
async function MessageContainerWithParams({ params }) {
  "use cache";
  const { channelId } = await params;

  if (!validChannelIds.includes(channelId)) {
    redirect("/channel/1");
  }

  const queryClient = getQueryClient();

  // Prefetch messages data - no await needed
  queryClient.prefetchQuery({
    queryKey: ["messages", channelId],
    queryFn: () => mockApi.getMessages(channelId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MessageContainer channelId={channelId} />
    </HydrationBoundary>
  );
}

export const unstable_prefetch = {
  mode: "runtime",
  samples: [{}],
};
