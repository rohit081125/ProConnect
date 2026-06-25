import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Loader2,
  Shield,
  UserRound,
  Users,
  Send,
  MessageSquare,
  Mail,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  banUser,
  getAdminStats,
  getAllReports,
  getAllUsers,
  suspendUser,
  unbanUser,
  updateReportStatus,
  warnUser,
  getAdminChatThreads,
  getMessages,
  sendMessage as sendMessageApi,
  markMessagesAsRead,
} from "@/lib/api";
import { useStore } from "@/lib/store";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleString();
}

function statusClass(status = "active") {
  const value = status.toLowerCase();
  if (value === "banned") return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400";
  if (value === "suspended") return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
}

function StatCard({ icon: Icon, label, value, tone = "primary" }) {
  const toneClass =
    tone === "danger"
      ? "bg-red-500/10 text-red-600"
      : tone === "warning"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-primary/10 text-primary";

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value ?? 0}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPortal() {
  const { toast } = useToast();
  const { currentUser } = useStore();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["users", "reports", "risk", "support-messages"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [query, setQuery] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [suspendDays, setSuspendDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState("");

  // Chat/Messaging States
  const [chatThreads, setChatThreads] = useState([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState("");
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatNewMessage, setChatNewMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatMessagesEndRef = useRef(null);

  // Action Modal States
  const [actionUserId, setActionUserId] = useState("");
  const [actionUserName, setActionUserName] = useState("");
  const [actionType, setActionType] = useState(""); // "warn" | "suspend" | "ban"
  const [customSuspendDays, setCustomSuspendDays] = useState(1); // 1, 7, 30
  const [customNote, setCustomNote] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);
  const [sendChatMessage, setSendChatMessage] = useState(true);

  // Direct Message to Party States
  const [messageRecipient, setMessageRecipient] = useState(null);
  const [messageType, setMessageType] = useState(""); // "reporter" or "reported"
  const [messageReport, setMessageReport] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const handleOpenMessageModal = (user, type, report) => {
    setMessageRecipient(user);
    setMessageType(type);
    setMessageReport(report);
    
    // Generate templates
    const reportId = report.id || report._id || "N/A";
    const reason = report.reason || "N/A";
    const recipientName = user.name || "User";
    
    // Find the other party's name to mention in the email/chat template
    const otherId = type === "reporter" ? report.reportedUserId : report.reporterId;
    const otherUser = users.find(u => (u.id || u._id) === otherId);
    const otherName = otherUser?.name || (type === "reporter" ? "the reported user" : "the reporter");

    let template = "";
    if (type === "reporter") {
      template = `Dear ${recipientName},\n\nThank you for reporting your concern regarding ${otherName}.\n\nOur administration team has received your report (Ref ID: ${reportId}) regarding "${reason}" and is actively reviewing the case. We will take appropriate action in accordance with our platform guidelines to ensure a safe and professional environment.\n\nBest regards,\nProConnect Admin Team`;
    } else {
      template = `Dear ${recipientName},\n\nWe have received a user report (Ref ID: ${reportId}) regarding your account activities, specifically concerning: "${reason}".\n\nPlease ensure that your actions comply with ProConnect's platform guidelines. Continued violations may result in account warnings, suspension, or a permanent ban.\n\nBest regards,\nProConnect Admin Team`;
    }
    
    setMessageText(template);
    setShowMessageModal(true);
  };

  const handleSendMessageToParty = async () => {
    const currentAdminId = currentUser?.id || currentUser?._id;
    const recipientId = messageRecipient?.id || messageRecipient?._id;
    if (!currentAdminId || !recipientId || !messageText.trim()) return;

    try {
      setSendingMessage(true);
      await sendMessageApi({
        senderId: currentAdminId,
        receiverId: recipientId,
        message: messageText.trim(),
        type: "text",
      });
      
      toast({
        title: "Message sent successfully!",
        description: `Your message has been delivered to ${messageRecipient.name}.`,
      });
      
      setShowMessageModal(false);
      setMessageRecipient(null);
      setMessageReport(null);
      setMessageText("");
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: error?.message || "Something went wrong while sending the message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const openActionModal = (userId, type, userName) => {
    setActionUserId(userId);
    setActionUserName(userName);
    setActionType(type);
    setCustomNote("");
    setCustomSuspendDays(1);
    setSendChatMessage(true);
    setShowActionModal(true);
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersResponse, reportsResponse, statsResponse, threadsResponse] = await Promise.all([
        getAllUsers(),
        getAllReports(),
        getAdminStats(),
        getAdminChatThreads().catch(() => []),
      ]);

      setUsers(Array.isArray(usersResponse) ? usersResponse : usersResponse?.data || []);
      setReports(Array.isArray(reportsResponse) ? reportsResponse : reportsResponse?.data || []);
      setStats(statsResponse || {});
      setChatThreads(Array.isArray(threadsResponse) ? threadsResponse : threadsResponse?.data || []);
    } catch (error) {
      toast({
        title: "Admin data failed to load",
        description: error?.message || "Please check the backend connection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Poll for messages in selected support conversation
  useEffect(() => {
    if (!selectedChatUserId) return;

    const loadSelectedChatUser = () => {
      const match = chatThreads.find(u => (u.id || u._id) === selectedChatUserId);
      if (match) setSelectedChatUser(match);
    };
    loadSelectedChatUser();

    const loadChatMessagesInterval = async () => {
      try {
        const currentAdminId = currentUser?.id || currentUser?._id;
        if (!currentAdminId) return;
        const response = await getMessages(currentAdminId, selectedChatUserId);
        const data = Array.isArray(response) ? response : response?.data || [];
        const sorted = [...data].sort(
          (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );
        setChatMessages(sorted);

        const hasUnread = data.some(msg => msg.senderId === selectedChatUserId && msg.isRead !== true && msg.read !== true);
        if (hasUnread) {
          await markMessagesAsRead(selectedChatUserId, currentAdminId);
          window.dispatchEvent(new Event("messagesMarkedRead"));
        }
      } catch (err) {}
    };

    loadChatMessagesInterval();
    const interval = setInterval(loadChatMessagesInterval, 2000);
    return () => clearInterval(interval);
  }, [selectedChatUserId, chatThreads, currentUser]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChatMessage = async () => {
    const currentAdminId = currentUser?.id || currentUser?._id;
    if (!currentAdminId || !selectedChatUserId || !chatNewMessage.trim()) return;

    try {
      setSendingChat(true);
      await sendMessageApi({
        senderId: currentAdminId,
        receiverId: selectedChatUserId,
        message: chatNewMessage.trim(),
        type: "text",
      });
      setChatNewMessage("");
      // Refresh chat list immediately
      const response = await getMessages(currentAdminId, selectedChatUserId);
      const data = Array.isArray(response) ? response : response?.data || [];
      const sorted = [...data].sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
      setChatMessages(sorted);
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: error?.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setSendingChat(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.name, user.email, user.role, user.accountStatus]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [query, users]);

  const reportedCounts = useMemo(() => {
    return reports.reduce((acc, report) => {
      if (!report.reportedUserId) return acc;
      acc[report.reportedUserId] = (acc[report.reportedUserId] || 0) + 1;
      return acc;
    }, {});
  }, [reports]);

  const suspiciousUsers = useMemo(() => {
    return users
      .filter(
        (user) =>
          (reportedCounts[user.id] || reportedCounts[user._id] || 0) >= 2 ||
          ["banned", "suspended"].includes((user.accountStatus || "").toLowerCase()) ||
          Number(user.warningCount || 0) >= 2
      )
      .sort((a, b) => {
        const countA = reportedCounts[a.id] || reportedCounts[a._id] || 0;
        const countB = reportedCounts[b.id] || reportedCounts[b._id] || 0;
        return countB - countA;
      });
  }, [users, reportedCounts]);

  const actOnUser = async (userId, action) => {
    const payload = { note: adminNote, suspendDays: Number(suspendDays) || 7 };

    try {
      setProcessing(`${action}-${userId}`);
      if (action === "ban") await banUser(userId, payload);
      if (action === "unban") await unbanUser(userId, payload);
      if (action === "suspend") await suspendUser(userId, payload);
      if (action === "warn") await warnUser(userId, payload);

      toast({ title: "User updated" });
      setAdminNote("");
      await loadAdminData();
    } catch (error) {
      toast({
        title: "Action failed",
        description: error?.message || "Could not update this user",
        variant: "destructive",
      });
    } finally {
      setProcessing("");
    }
  };

  const handleConfirmAction = async () => {
    if (!actionUserId || !actionType) return;

    const payload = {
      note: customNote.trim() || `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}ed by admin`,
      suspendDays: actionType === "suspend" ? Number(customSuspendDays) : 0,
    };

    try {
      setProcessing(`${actionType}-${actionUserId}`);
      if (actionType === "ban") await banUser(actionUserId, payload);
      if (actionType === "suspend") await suspendUser(actionUserId, payload);
      if (actionType === "warn") await warnUser(actionUserId, payload);

      if (sendChatMessage) {
        try {
          const currentAdminId = currentUser?.id || currentUser?._id;
          if (currentAdminId) {
            const actionWord = actionType === "warn" ? "Warning" : actionType === "suspension" ? "Suspension" : "Ban";
            let msgText = `[ADMIN NOTICE: Account ${actionType.toUpperCase()}]\nReason: ${payload.note}`;
            if (actionType === "suspend") {
              const durText = customSuspendDays === 1 ? "1 Day" : customSuspendDays === 7 ? "1 Week" : "1 Month";
              msgText += `\nDuration: ${durText}`;
            } else if (actionType === "ban") {
              msgText += `\nDuration: Permanent`;
            }
            await sendMessageApi({
              senderId: currentAdminId,
              receiverId: actionUserId,
              message: msgText,
              type: "text"
            });
          }
        } catch (chatErr) {
          console.error("Failed to send direct chat message explaining action", chatErr);
        }
      }

      toast({
        title: "Action Successful",
        description: `Successfully executed ${actionType} on ${actionUserName}.`,
      });
      setShowActionModal(false);
      await loadAdminData();
    } catch (error) {
      toast({
        title: "Action failed",
        description: error?.message || "Could not execute action",
        variant: "destructive",
      });
    } finally {
      setProcessing("");
    }
  };

  const closeReport = async (reportId, status) => {
    try {
      setProcessing(`${status}-${reportId}`);
      await updateReportStatus(reportId, {
        status,
        adminNote: adminNote || `Marked as ${status}`,
      });
      toast({ title: "Report updated" });
      setAdminNote("");
      await loadAdminData();
    } catch (error) {
      toast({
        title: "Report update failed",
        description: error?.message || "Could not update report",
        variant: "destructive",
      });
    } finally {
      setProcessing("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto pb-24">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Shield className="h-3.5 w-3.5" />
              Admin Portal
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Trust, Safety, and Platform Operations</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Review users, investigate reports, and act on suspicious accounts from one operational console.
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Total Users" value={stats.users} />
          <StatCard icon={AlertTriangle} label="Open Reports" value={stats.openReports} tone="warning" />
          <StatCard icon={Ban} label="Banned Users" value={stats.bannedUsers} tone="danger" />
          <StatCard icon={Clock} label="Suspended Users" value={stats.suspendedUsers} tone="warning" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 rounded-xl">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="risk">Risk Monitor</TabsTrigger>
            <TabsTrigger value="support-messages">Support Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-5">
            <div className="mb-4">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users by name, email, role, or status"
                className="max-w-xl"
              />
            </div>

            <div className="grid gap-4">
              {filteredUsers.map((user) => {
                const userId = user.id || user._id;
                const reportCount = reportedCounts[userId] || 0;

                return (
                  <Card key={userId} className="rounded-2xl border shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <Link href={`/users/${userId}`} className="flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                        <Avatar className="h-11 w-11 border shrink-0">
                          <AvatarImage src={user.profileImage || ""} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium hover:underline">{user.name || "Unnamed User"}</p>
                            <Badge variant="outline" className={statusClass(user.accountStatus)}>
                              {user.accountStatus || "active"}
                            </Badge>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Reports: {reportCount} | Warnings: {user.warningCount || 0} | Last login: {formatDate(user.lastLoginAt)}
                          </p>
                        </div>
                      </Link>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionModal(userId, "warn", user.name)}
                          disabled={processing === `warn-${userId}`}
                        >
                          Warn
                        </Button>
                        {(user.accountStatus || "active").toLowerCase() === "suspended" ? (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={() => actOnUser(userId, "unban")}
                            disabled={processing === `unban-${userId}`}
                          >
                            Unsuspend
                          </Button>
                        ) : (user.accountStatus || "active").toLowerCase() === "banned" ? (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={() => actOnUser(userId, "unban")}
                            disabled={processing === `unban-${userId}`}
                          >
                            Unban
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionModal(userId, "suspend", user.name)}
                              disabled={processing === `suspend-${userId}`}
                            >
                              Suspend
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openActionModal(userId, "ban", user.name)}
                              disabled={processing === `ban-${userId}`}
                            >
                              Ban
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-5">
            <div className="grid gap-4">
              {reports.length > 0 ? (
                reports.map((report) => {
                  const reporter = users.find((u) => (u.id || u._id) === report.reporterId);
                  const reported = users.find((u) => (u.id || u._id) === report.reportedUserId);

                  return (
                    <Card key={report.id || report._id} className="rounded-2xl border shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={statusClass(report.status)}>
                                {report.status || "open"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(report.createdAt)}
                              </span>
                            </div>
                            <h3 className="mt-3 font-semibold">{report.reason}</h3>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                              {report.description || "No details provided."}
                            </p>

                            <div className="mt-4 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
                              {/* Reporter Info */}
                              <div className="rounded-2xl border bg-muted/20 p-4 flex flex-col justify-between space-y-3">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <UserRound className="h-3.5 w-3.5 text-primary" />
                                    <span>Reporter Details</span>
                                  </div>
                                  {reporter ? (
                                    <Link href={`/users/${reporter.id || reporter._id}`} className="space-y-1 block hover:opacity-85 transition-opacity cursor-pointer">
                                      <p className="text-sm font-semibold text-foreground hover:underline">{reporter.name}</p>
                                      <p className="text-xs text-muted-foreground break-all">{reporter.email}</p>
                                      <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider py-0.5 px-2">
                                        {reporter.role || "user"}
                                      </Badge>
                                    </Link>
                                  ) : (
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-foreground">Unknown User</p>
                                      <p className="text-xs text-muted-foreground break-all">ID: {report.reporterId}</p>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full justify-center text-xs h-9 rounded-xl border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary transition-all duration-300"
                                  onClick={() => handleOpenMessageModal(reporter, "reporter", report)}
                                  disabled={!reporter}
                                >
                                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                                  Message Reporter
                                </Button>
                              </div>

                              {/* Reported User Info */}
                              <div className="rounded-2xl border bg-muted/20 p-4 flex flex-col justify-between space-y-3">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                                    <span>Reported Party</span>
                                  </div>
                                  {reported ? (
                                    <Link href={`/users/${reported.id || reported._id}`} className="space-y-1 block hover:opacity-85 transition-opacity cursor-pointer">
                                      <p className="text-sm font-semibold text-foreground hover:underline">{reported.name}</p>
                                      <p className="text-xs text-muted-foreground break-all">{reported.email}</p>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider py-0.5 px-2">
                                          {reported.role || "user"}
                                        </Badge>
                                        {reported.warningCount > 0 && (
                                          <Badge variant="destructive" className="text-[10px] font-bold py-0.5 px-2">
                                            {reported.warningCount} Warnings
                                          </Badge>
                                        )}
                                      </div>
                                    </Link>
                                  ) : (
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-foreground">Unknown User</p>
                                      <p className="text-xs text-muted-foreground break-all">ID: {report.reportedUserId}</p>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full justify-center text-xs h-9 rounded-xl border-destructive/20 hover:border-destructive/50 hover:bg-destructive/5 text-destructive transition-all duration-300"
                                  onClick={() => handleOpenMessageModal(reported, "reported", report)}
                                  disabled={!reported}
                                >
                                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                                  Message Reported Party
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 self-start lg:self-auto shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => closeReport(report.id || report._id, "reviewing")}
                              disabled={processing === `reviewing-${report.id || report._id}`}
                              className="rounded-xl"
                            >
                              Review
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => closeReport(report.id || report._id, "resolved")}
                              disabled={processing === `resolved-${report.id || report._id}`}
                              className="rounded-xl"
                            >
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="rounded-2xl border shadow-sm">
                  <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    No reports submitted yet.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="risk" className="mt-5">
            <div className="grid gap-4 md:grid-cols-2">
              {suspiciousUsers.length > 0 ? (
                suspiciousUsers.map((user) => {
                  const userId = user.id || user._id;
                  return (
                    <Card key={userId} className="rounded-2xl border shadow-sm">
                      <CardContent className="p-5">
                        <Link href={`/users/${userId}`} className="flex items-start gap-3 hover:opacity-85 transition-opacity cursor-pointer">
                          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 shrink-0">
                            <UserRound className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium hover:underline">{user.name || "Unnamed User"}</p>
                            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="outline" className={statusClass(user.accountStatus)}>
                                {user.accountStatus || "active"}
                              </Badge>
                              <Badge variant="secondary">
                                {reportedCounts[userId] || 0} reports
                              </Badge>
                              <Badge variant="secondary">
                                {user.warningCount || 0} warnings
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="rounded-2xl border shadow-sm md:col-span-2">
                  <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    No high-risk accounts currently match the monitoring thresholds.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          <TabsContent value="support-messages" className="mt-5">
            <Card className="rounded-2xl border shadow-sm overflow-hidden bg-card">
              <div className="grid grid-cols-1 md:grid-cols-12 h-[550px]">
                {/* Left Pane: Conversations List */}
                <div className="md:col-span-4 border-r flex flex-col h-full bg-muted/10">
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-semibold">Support Chats</h3>
                    <p className="text-xs text-muted-foreground mt-1">Users requesting admin assistance</p>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-border/50">
                    {chatThreads.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        No support messages received yet.
                      </div>
                    ) : (
                      chatThreads.map((threadUser) => {
                        const threadUserId = threadUser.id || threadUser._id;
                        const isSelected = selectedChatUserId === threadUserId;
                        return (
                          <button
                            key={threadUserId}
                            onClick={() => setSelectedChatUserId(threadUserId)}
                            className={`w-full text-left p-4 hover:bg-muted/40 transition-colors flex items-center gap-3 ${
                              isSelected ? "bg-primary/10 hover:bg-primary/15" : ""
                            }`}
                          >
                            <Avatar className="h-9 w-9 border">
                              <AvatarImage src={threadUser.profileImage || ""} alt={threadUser.name} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {getInitials(threadUser.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{threadUser.name || "Unnamed User"}</p>
                              <p className="truncate text-xs text-muted-foreground">{threadUser.email}</p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Pane: Chat Window */}
                <div className="md:col-span-8 flex flex-col h-full bg-background/30">
                  {selectedChatUserId ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b bg-card flex items-center gap-3 shrink-0">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={selectedChatUser?.profileImage || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(selectedChatUser?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{selectedChatUser?.name || "Support Conversation"}</p>
                          <p className="text-xs text-muted-foreground">{selectedChatUser?.email}</p>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
                        {chatMessages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <MessageSquare className="h-8 w-8 text-muted-foreground/60 mb-2 animate-bounce" />
                            <p className="text-sm font-medium text-muted-foreground">No messages in this support conversation.</p>
                            <p className="text-xs text-muted-foreground/80 mt-1">Send a reply to start helping this user.</p>
                          </div>
                        ) : (
                          chatMessages.map((msg) => {
                            const isMine = msg.senderId === (currentUser?.id || currentUser?._id);
                            return (
                              <div
                                key={msg.id || `${msg.senderId}-${msg.createdAt}`}
                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                    isMine
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-foreground"
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                  <span className="text-[10px] opacity-70 block text-right mt-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={chatMessagesEndRef} />
                      </div>

                      {/* Chat Input */}
                      <div className="p-4 border-t bg-card shrink-0">
                        <div className="flex items-center gap-2">
                          <Input
                            value={chatNewMessage}
                            placeholder="Type a support reply..."
                            onChange={(e) => setChatNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendChatMessage();
                              }
                            }}
                            className="bg-background"
                          />
                          <Button
                            onClick={handleSendChatMessage}
                            disabled={!chatNewMessage.trim() || sendingChat}
                            size="icon"
                            className="bg-primary hover:bg-primary/95 shadow-md shadow-primary/20 shrink-0"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-3" />
                      <h4 className="text-base font-semibold">Select a Support Conversation</h4>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Choose a user from the list on the left to read their messages and provide operational support.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-[9999] bg-black/80 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl border border-border bg-card shadow-2xl p-6 text-left align-middle transition-all space-y-4">
              <div className="space-y-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {actionType === "warn" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                  {actionType === "suspend" && <Clock className="h-5 w-5 text-amber-500" />}
                  {actionType === "ban" && <Ban className="h-5 w-5 text-red-500" />}
                  {actionType === "warn" && "Issue Account Warning"}
                  {actionType === "suspend" && "Suspend User Account"}
                  {actionType === "ban" && "Permanently Ban User"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {actionType === "warn" && `You are issuing a warning to ${actionUserName}. The user will receive a warning notification and a popup alert next time they check their dashboard.`}
                  {actionType === "suspend" && `You are temporarily suspending ${actionUserName}. The user will be logged out and unable to access their account for the duration of the suspension.`}
                  {actionType === "ban" && `CAUTION: You are about to permanently ban ${actionUserName}. This action is permanent and cannot be undone.`}
                </p>
              </div>

              <div className="space-y-4 py-2">
                {actionType === "suspend" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Suspension Duration
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomSuspendDays(1)}
                        className={`h-11 rounded-xl border text-sm font-semibold transition-all ${
                          customSuspendDays === 1
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        1 Day
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomSuspendDays(7)}
                        className={`h-11 rounded-xl border text-sm font-semibold transition-all ${
                          customSuspendDays === 7
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        1 Week
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomSuspendDays(30)}
                        className={`h-11 rounded-xl border text-sm font-semibold transition-all ${
                          customSuspendDays === 30
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        1 Month
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Reason / Admin Note
                  </label>
                  <Textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder={
                      actionType === "warn"
                        ? "Enter reason for warning (e.g. Inappropriate behavior)"
                        : actionType === "suspend"
                        ? "Enter reason for suspension"
                        : "Enter reason for permanent ban"
                    }
                    className="min-h-24 rounded-2xl"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="send-chat-msg"
                    checked={sendChatMessage}
                    onChange={(e) => setSendChatMessage(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                  <label htmlFor="send-chat-msg" className="text-sm text-foreground select-none cursor-pointer">
                    Send direct chat message to user with the reason
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowActionModal(false)}
                  className="rounded-xl h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  disabled={processing !== ""}
                  className={`rounded-xl h-11 px-6 ${
                    actionType === "ban"
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
                      : actionType === "suspend"
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Message to Party Modal */}
      {showMessageModal && messageRecipient && (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-[9999] bg-black/80 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative w-full max-w-lg transform overflow-hidden rounded-3xl border bg-card shadow-2xl p-6 flex flex-col space-y-4 align-middle transition-all text-left">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-lg font-bold text-foreground">
                  Message {messageRecipient.name} ({messageType === "reporter" ? "Reporter" : "Reported"})
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={() => setShowMessageModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-muted/30 p-3 border text-xs text-muted-foreground space-y-1">
                  <p><span className="font-semibold text-foreground">Recipient:</span> {messageRecipient.name} ({messageRecipient.email})</p>
                  <p><span className="font-semibold text-foreground">Report Ref:</span> {messageReport?.id || messageReport?._id || "N/A"}</p>
                  <p><span className="font-semibold text-foreground">Reason:</span> {messageReport?.reason || "N/A"}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Professional Message Text</label>
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Enter the professional message to be sent to this user..."
                    className="min-h-48 rounded-2xl text-sm leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowMessageModal(false)}
                  className="rounded-xl h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessageToParty}
                  disabled={sendingMessage || !messageText.trim()}
                  className="rounded-xl h-11 px-6 bg-primary hover:bg-primary/90 text-white"
                >
                  {sendingMessage ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="h-4 w-4" />
                      Send Message
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
