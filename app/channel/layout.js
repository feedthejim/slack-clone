import { Suspense } from "react";
import { ClientWrapper } from "../providers";
import { PrefetchDebugger, Sidebar } from "../components";
import { getChannels } from "../server-lib";

function SidebarSkeleton() {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Slack Clone</h1>
        <p className="text-sm text-gray-400">workspace.slack.com</p>
      </div>
      <div className="flex-1 p-2">
        <div className="animate-pulse">
          <h3 className="text-sm font-semibold text-gray-300 mb-2 px-4">
            Channels
          </h3>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-2 mb-1">
              <div className="h-4 bg-gray-600 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function SidebarWithData() {
  const channels = await getChannels();
  return <Sidebar channels={channels} />;
}

export default function ChannelLayout({ children }) {
  return (
    <ClientWrapper>
      <div className="flex h-screen">
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarWithData />
        </Suspense>
        <div className="flex-1">
          {children}
        </div>
      </div>
      <PrefetchDebugger />
    </ClientWrapper>
  );
}
