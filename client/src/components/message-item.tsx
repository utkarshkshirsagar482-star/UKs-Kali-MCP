import { memo } from "react";
import { Message } from "@shared/schema";

interface MessageItemProps {
  msg: Message;
}

export const MessageItem = memo(({ msg }: MessageItemProps) => {
  return (
    <div
      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          msg.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <div className="whitespace-pre-wrap">{msg.content}</div>
        {msg.isAgentic && (
          <div className="mt-1 text-xs opacity-70 border-t pt-1 border-primary-foreground/20">
            Step: {msg.agentStep}
          </div>
        )}
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";
