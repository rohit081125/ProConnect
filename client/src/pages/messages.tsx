import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/lib/store";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";

export default function Messages() {
  const { currentUser, getChatThreads, getUserById, messages, sendMessage, markMessagesRead } = useStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threads = getChatThreads();
  const selectedUser = selectedUserId ? getUserById(selectedUserId) : null;

  const chatMessages = selectedUserId
    ? messages.filter(m =>
        (m.senderId === currentUser?.id && m.receiverId === selectedUserId) ||
        (m.senderId === selectedUserId && m.receiverId === currentUser?.id)
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  useEffect(() => {
    if (selectedUserId) {
      markMessagesRead(selectedUserId);
    }
  }, [selectedUserId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedUserId) return;
    sendMessage(selectedUserId, newMessage.trim());
    setNewMessage("");
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <div className="flex-1 flex overflow-hidden pb-16" style={{ height: "calc(100vh - 3.5rem - 4rem)" }}>
      <div className={`${selectedUserId ? "hidden sm:flex" : "flex"} flex-col w-full sm:w-80 sm:border-r`}>
        <div className="p-4 border-b">
          <h2 className="font-semibold">Messages</h2>
        </div>
        <ScrollArea className="flex-1">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold text-sm">No messages yet</h3>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Messages will appear here after someone accepts your application or you accept theirs.
              </p>
            </div>
          ) : (
            threads.map(thread => {
              const participant = getUserById(thread.participantId);
              return (
                <button
                  key={thread.participantId}
                  onClick={() => setSelectedUserId(thread.participantId)}
                  className={`w-full flex items-center gap-3 p-3 border-b hover-elevate text-left ${
                    selectedUserId === thread.participantId ? "bg-primary/5" : ""
                  }`}
                  data-testid={`chat-thread-${thread.participantId}`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {participant?.name.split(" ").map(n => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{participant?.name || "Unknown"}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatTime(thread.lastTimestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
                      {thread.unreadCount > 0 && (
                        <span className="flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </ScrollArea>
      </div>

      <div className={`${selectedUserId ? "flex" : "hidden sm:flex"} flex-col flex-1`}>
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3 p-3 border-b">
              <Button
                size="icon"
                variant="ghost"
                className="sm:hidden"
                onClick={() => setSelectedUserId(null)}
                data-testid="button-back-chat"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {selectedUser.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground">@{selectedUser.username}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {chatMessages.map(msg => {
                  const isMine = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-md text-sm ${
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`} data-testid={`message-${msg.id}`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                  data-testid="input-message"
                />
                <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()} data-testid="button-send">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="font-semibold">Select a conversation</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose from your existing conversations on the left</p>
          </div>
        )}
      </div>
    </div>
  );
}
