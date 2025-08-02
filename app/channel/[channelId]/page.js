import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getChannelById } from "../../server-lib";
import {
  MessageList,
  MessageInput,
  MessageListSkeleton,
} from "../../components";

const validChannelIds = ["1", "2", "3", "4", "5"];

async function ChannelContent({ params }) {
  const { channelId } = await params;

  if (!validChannelIds.includes(channelId)) {
    redirect("/channel/1");
  }

  return <ChatInterface channelId={channelId} user="John Doe" />;
}

function ChatLoadingSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-3 bg-gray-100 rounded animate-pulse"></div>
              </div>
              <div
                className={`space-y-2 ${
                  i % 3 === 0 ? "w-3/4" : i % 2 === 0 ? "w-1/2" : "w-5/6"
                }`}
              >
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                {i % 3 === 0 && (
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Skeleton */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function ChannelPage({ params }) {
  return (
    <Suspense fallback={<ChatLoadingSkeleton />}>
      <ChannelContent params={params} />
    </Suspense>
  );
}

// Channel Header Component
async function ChannelHeader({ channelId }) {
  const channel = await getChannelById(channelId);

  if (!channel) {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="text-gray-500">Channel not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            <span className="mr-2">{channel.isPrivate ? "🔒" : "#"}</span>
            {channel.name}
          </h2>
          <p className="text-sm text-gray-500">
            {channel.topic || channel.description}
          </p>
        </div>
        <div className="text-sm text-gray-400">
          {channel.memberCount} members
        </div>
      </div>
    </div>
  );
}

// Chat Interface Component with TanStack experimental data fetching
function ChatInterface({ channelId, user }) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <ChannelHeader channelId={channelId} />
      <Suspense fallback={<MessageListSkeleton />}>
        <MessageList channelId={channelId} />
      </Suspense>
      <MessageInput channelId={channelId} user={user} />
    </div>
  );
}
