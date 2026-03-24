import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/lib/store";
import {
  getApplicationsByApplicant,
  getApplicationsByWork,
  getWorksByUser,
  getWorkById,
  getUserProfile,
  getMessages,
  sendMessage as sendMessageApi,
  markMessagesAsRead,
  uploadChatFile,
} from "@/lib/api";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";

function getSafeId(item) {
  return item?.id || item?._id || "";
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPreview(message, type, fileName) {
  if (type === "image") return "📷 Image";
  if (type === "file") return fileName ? `📄 ${fileName}` : "📄 File";
  if (!message) return "No messages yet";
  return message.length > 32 ? `${message.slice(0, 32)}...` : message;
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Messages() {
  const { currentUser } = useStore();
  const [location] = useLocation();

  const currentUserId = currentUser?.id || currentUser?._id || "";
  const queryString = location.includes("?") ? location.split("?")[1] : "";
  const params = new URLSearchParams(queryString);
  const initialUserId = params.get("userId") || "";

  const [contacts, setContacts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [lastMessages, setLastMessages] = useState({});

  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const previousMessageCountRef = useRef(0);

  useEffect(() => {
    if (initialUserId) {
      setSelectedUserId(initialUserId);
    }
  }, [initialUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    loadContacts();
  }, [currentUserId]);

  useEffect(() => {
    if (contacts.length > 0 && currentUserId) {
      loadLastMessages();
    }
  }, [contacts, currentUserId]);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      setMessages([]);
      return;
    }

    const loadChatData = async () => {
      await handleMarkRead(selectedUserId);
      await loadSelectedUser();
      await loadMessages(selectedUserId, true);
      await loadLastMessages(selectedUserId);
    };

    loadChatData();

    const interval = setInterval(() => {
      loadMessages(selectedUserId, false);
      loadLastMessages(selectedUserId);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedUserId, currentUserId]);

  useEffect(() => {
    if (messages.length > previousMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    previousMessageCountRef.current = messages.length;
  }, [messages]);

  const loadContacts = async () => {
    try {
      setLoadingContacts(true);

      const contactMap = new Map();

      const sentAppsResponse = await getApplicationsByApplicant(currentUserId);
      const sentApps = Array.isArray(sentAppsResponse)
        ? sentAppsResponse
        : sentAppsResponse?.data || [];

      await Promise.all(
        sentApps.map(async (app) => {
          if (app.status !== "accepted") return;

          try {
            const workOwnerId = await fetchWorkPosterId(app.workId);
            if (!workOwnerId) return;

            const userResponse = await getUserProfile(workOwnerId);
            const user = userResponse?.data || userResponse;

            const safeId = getSafeId(user) || workOwnerId;

            if (safeId && safeId !== currentUserId) {
              contactMap.set(safeId, {
                id: safeId,
                name: user?.name || "Unknown User",
                profileImage: user?.profileImage || "",
              });
            }
          } catch (error) {}
        })
      );

      const myWorksResponse = await getWorksByUser(currentUserId);
      const myWorks = Array.isArray(myWorksResponse)
        ? myWorksResponse
        : myWorksResponse?.data || [];

      await Promise.all(
        myWorks.map(async (work) => {
          const workId = getSafeId(work);
          if (!workId) return;

          try {
            const appsResponse = await getApplicationsByWork(workId);
            const apps = Array.isArray(appsResponse)
              ? appsResponse
              : appsResponse?.data || [];

            await Promise.all(
              apps.map(async (app) => {
                if (app.status !== "accepted" || !app.applicantId) return;

                try {
                  const userResponse = await getUserProfile(app.applicantId);
                  const user = userResponse?.data || userResponse;

                  const safeId = getSafeId(user) || app.applicantId;

                  if (safeId && safeId !== currentUserId) {
                    contactMap.set(safeId, {
                      id: safeId,
                      name: user?.name || "Unknown User",
                      profileImage: user?.profileImage || "",
                    });
                  }
                } catch (error) {}
              })
            );
          } catch (error) {}
        })
      );

      const contactsArray = Array.from(contactMap.values());
      setContacts(contactsArray);

      if (!selectedUserId && contactsArray.length > 0) {
        setSelectedUserId(contactsArray[0].id);
      }
    } catch (error) {
      console.error("Failed to load contacts:", error);
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchWorkPosterId = async (workId) => {
    try {
      const workResponse = await getWorkById(workId);
      const work = workResponse?.data || workResponse;
      return work?.postedBy || "";
    } catch (error) {
      return "";
    }
  };

  const loadSelectedUser = async () => {
    try {
      const response = await getUserProfile(selectedUserId);
      const user = response?.data || response;
      setSelectedUser(user);
    } catch (error) {
      setSelectedUser(null);
    }
  };

  const handleMarkRead = async (chatUserId) => {
    if (!currentUserId || !chatUserId) return;

    try {
      await markMessagesAsRead(chatUserId, currentUserId);
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const loadMessages = async (chatUserId = selectedUserId, showLoader = false) => {
    if (!currentUserId || !chatUserId) return;

    try {
      if (showLoader) {
        setLoadingMessages(true);
      }

      const response = await getMessages(currentUserId, chatUserId);
      const data = Array.isArray(response) ? response : response?.data || [];

      const sorted = [...data].sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
      );

      setMessages(sorted);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    } finally {
      if (showLoader) {
        setLoadingMessages(false);
      }
    }
  };

  const loadLastMessages = async (openedChatUserId = "") => {
    if (!currentUserId || contacts.length === 0) return;

    try {
      const temp = {};

      await Promise.all(
        contacts.map(async (contact) => {
          try {
            const response = await getMessages(currentUserId, contact.id);
            const data = Array.isArray(response) ? response : response?.data || [];

            const sorted = [...data].sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
            );

            const last = sorted[0];
            const isCurrentlyOpened =
              openedChatUserId === contact.id || selectedUserId === contact.id;

            temp[contact.id] = {
              message: last?.message || "",
              type: last?.type || "text",
              fileName: last?.fileName || "",
              time: last?.createdAt || "",
              isNewFromOther:
                !!last &&
                last.senderId === contact.id &&
                !last.isRead &&
                !isCurrentlyOpened,
            };
          } catch (error) {
            temp[contact.id] = {
              message: "",
              type: "text",
              fileName: "",
              time: "",
              isNewFromOther: false,
            };
          }
        })
      );

      setLastMessages(temp);
    } catch (error) {
      console.error("Failed to load last message previews:", error);
    }
  };

  const handleSend = async () => {
    if (!currentUserId || !selectedUserId) return;
    if (!newMessage.trim() && !selectedFile) return;

    try {
      setSending(true);

      if (selectedFile) {
        const uploadUrl = await uploadChatFile(selectedFile);

        if (!uploadUrl) {
          throw new Error("File upload failed");
        }

        const isImage = selectedFile.type?.startsWith("image");

        await sendMessageApi({
          senderId: currentUserId,
          receiverId: selectedUserId,
          message: "",
          type: isImage ? "image" : "file",
          fileUrl: uploadUrl,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        });

        setSelectedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      if (newMessage.trim()) {
        await sendMessageApi({
          senderId: currentUserId,
          receiverId: selectedUserId,
          message: newMessage.trim(),
          type: "text",
        });

        setNewMessage("");
      }

      await loadMessages(selectedUserId, false);
      await loadLastMessages(selectedUserId);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const timeA = new Date(lastMessages[a.id]?.time || 0).getTime();
      const timeB = new Date(lastMessages[b.id]?.time || 0).getTime();
      return timeB - timeA;
    });
  }, [contacts, lastMessages]);

  const showSidebarOnly = !selectedUserId;

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-background pb-20">
      <div className="mx-auto flex h-full w-full max-w-7xl overflow-hidden border bg-card md:rounded-2xl">
        <div
          className={`
            ${showSidebarOnly ? "flex" : "hidden md:flex"}
            w-full min-w-0 flex-col border-r bg-card md:w-[28%] lg:w-[24%]
          `}
        >
          <div className="border-b px-4 py-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Your accepted chats
            </p>
          </div>

          <ScrollArea className="flex-1">
            {loadingContacts ? (
              <div className="p-4 text-sm text-muted-foreground">
                Loading chats...
              </div>
            ) : sortedContacts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-4 py-16 text-center">
                <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">No chats available</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accepted application chats will appear here
                </p>
              </div>
            ) : (
              sortedContacts.map((contact) => {
                const preview = lastMessages[contact.id] || {};

                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedUserId(contact.id)}
                    className={`w-full border-b px-4 py-3 text-left transition hover:bg-muted/40 ${
                      selectedUserId === contact.id ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.profileImage || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-sm ${
                              preview.isNewFromOther
                                ? "font-bold text-foreground"
                                : "font-medium"
                            }`}
                          >
                            {contact.name}
                          </p>

                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(preview.time)}
                          </span>
                        </div>

                        <p
                          className={`truncate text-xs ${
                            preview.isNewFromOther
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatPreview(
                            preview.message,
                            preview.type,
                            preview.fileName
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </ScrollArea>
        </div>

        <div
          className={`
            ${selectedUserId ? "flex" : "hidden md:flex"}
            min-w-0 flex-1 flex-col
          `}
        >
          {selectedUserId ? (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedUserId("")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser?.profileImage || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedUser?.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {selectedUser?.name || "Loading user..."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Active conversation
                  </p>
                </div>
              </div>

              <ScrollArea className="flex-1 bg-background/40 px-4 py-4">
                {loadingMessages ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Start the conversation now
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMine = msg.senderId === currentUserId;

                      return (
                        <div
                          key={msg.id || `${msg.senderId}-${msg.createdAt}`}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[70%] ${
                              isMine
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {msg.type === "text" && (
                              <p className="whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>
                            )}

                            {msg.type === "image" && (
                              <div className="space-y-2">
                                <img
                                  src={msg.fileUrl}
                                  alt={msg.fileName || "chat-image"}
                                  className="max-h-60 rounded-lg object-cover"
                                />
                                {msg.fileName && (
                                  <p className="text-xs opacity-80">
                                    {msg.fileName}
                                  </p>
                                )}
                              </div>
                            )}

                            {msg.type === "file" && (
                              <div className="rounded-lg bg-white/10 p-2">
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block break-all text-sm font-medium underline"
                                >
                                  📄 {msg.fileName || "Open file"}
                                </a>
                                <p className="mt-1 text-[10px] opacity-70">
                                  {msg.fileType || "File"}
                                  {msg.fileSize
                                    ? ` • ${formatFileSize(msg.fileSize)}`
                                    : ""}
                                </p>
                              </div>
                            )}

                            <div className="mt-1 text-[10px] opacity-70">
                              {formatTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="border-t bg-card px-3 py-3">
                {selectedFile && (
                  <div className="mb-2 flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{selectedFile.name}</p>
                      <p className="text-muted-foreground">
                        {selectedFile.type || "File"} •{" "}
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="ml-3 text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer rounded-md px-2 py-2 hover:bg-muted">
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                        }
                      }}
                    />
                    <span className="text-xl">📎</span>
                  </label>

                  <Input
                    value={newMessage}
                    placeholder="Type your message..."
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="bg-background"
                  />

                  <Button
                    onClick={handleSend}
                    disabled={(!newMessage.trim() && !selectedFile) || sending}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden h-full items-center justify-center md:flex">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">Select a chat</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose a person from the left side
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}