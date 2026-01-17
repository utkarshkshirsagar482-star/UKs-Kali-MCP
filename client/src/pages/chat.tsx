import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Message, InsertMessage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Trash2 } from "lucide-react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 1000, // Simple polling for now
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/agent/chat", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setInput("");
    },
  });

  const clearMutation = useMutation({
      mutationFn: async () => {
          await apiRequest("DELETE", "/api/messages");
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      }
  })

  const handleSend = () => {
    if (!input.trim()) return;
    sendMutation.mutate(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="flex items-center justify-between p-4 border-b bg-card">
          <h2 className="font-semibold">Chat</h2>
          <Button variant="ghost" size="icon" onClick={() => clearMutation.mutate()}>
              <Trash2 className="h-4 w-4" />
          </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {messages?.map((msg) => (
          <div
            key={msg.id}
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
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-background border-t">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            className="flex-1 min-h-[40px] max-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSend} size="icon" disabled={sendMutation.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
