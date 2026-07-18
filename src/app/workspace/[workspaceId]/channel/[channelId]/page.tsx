"use client";

import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { Loader, TriangleAlert } from "lucide-react";
import { ChannelHeader } from "./header";
import { ChatInput } from "./chat-input";
import { MessageList } from "@/components/message-list";

const ChannelIdPage = () => {
  const channelId = useChannelId();
  const { data: channel, isLoading: channelLoading } = useGetChannel({
    id: channelId,
  });

  if (channelLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="animate-spin size-5 text-muted-foreground" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <TriangleAlert className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Channel not found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChannelHeader
        title={channel.name}
        topic={channel.topic}
        description={channel.description}
      />
      <MessageList
        channelId={channel._id}
        channelName={channel.name}
        channelCreationTime={channel._creationTime}
        channelTopic={channel.topic}
      />
      <ChatInput placeholder={`Message # ${channel.name}`} channelId={channelId} />
    </div>
  );
};

export default ChannelIdPage;
