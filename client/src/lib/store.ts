import { create } from "zustand";
import type { User, WorkPost, Application, Message, Review, Report, Notification, ChatThread } from "./types";
import { dummyUsers, dummyWorkPosts, dummyApplications, dummyMessages, dummyReviews, dummyNotifications } from "./dummy-data";

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  workPosts: WorkPost[];
  applications: Application[];
  messages: Message[];
  reviews: Review[];
  reports: Report[];
  notifications: Notification[];

  signup: (name: string, email: string, password: string) => string;
  setupProfile: (userId: string, data: Partial<User>) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  addWorkPost: (post: Omit<WorkPost, "id" | "postedDate">) => void;
  applyToWork: (application: Omit<Application, "id" | "appliedDate" | "status">) => void;
  acceptApplication: (applicationId: string) => void;
  rejectApplication: (applicationId: string) => void;
  completeWork: (applicationId: string, rating: number, reviewComment: string) => void;

  sendMessage: (receiverId: string, content: string) => void;
  markMessagesRead: (otherUserId: string) => void;
  getChatThreads: () => ChatThread[];

  submitReport: (report: Omit<Report, "id" | "date">) => void;

  updateProfile: (data: Partial<User>) => void;
  markNotificationRead: (notifId: string) => void;

  getUserById: (id: string) => User | undefined;
  getWorkById: (id: string) => WorkPost | undefined;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  users: [...dummyUsers],
  workPosts: [...dummyWorkPosts],
  applications: [...dummyApplications],
  messages: [...dummyMessages],
  reviews: [...dummyReviews],
  reports: [],
  notifications: [...dummyNotifications],

  signup: (name, email, password) => {
    const existing = get().users.find(u => u.email === email);
    if (existing) return "";
    const id = `user-${Date.now()}`;
    const username = name.toLowerCase().replace(/\s+/g, "");
    const newUser: User = {
      id, name, email, password, username,
      photo: "", bio: "", skills: [], location: "",
      portfolioLinks: [], socialLinks: [],
      education: "", experience: "",
      rating: 0, totalRatings: 0, completedWorks: 0,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    set(state => ({ users: [...state.users, newUser] }));
    return id;
  },

  setupProfile: (userId, data) => {
    set(state => ({
      users: state.users.map(u => u.id === userId ? { ...u, ...data } : u),
      currentUser: state.currentUser?.id === userId ? { ...state.currentUser, ...data } : state.currentUser,
      isAuthenticated: true,
    }));
    const user = get().users.find(u => u.id === userId);
    if (user) set({ currentUser: user });
  },

  login: (email, password) => {
    const user = get().users.find(u => u.email === email && u.password === password);
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  addWorkPost: (post) => {
    const id = `work-${Date.now()}`;
    const newPost: WorkPost = {
      ...post,
      id,
      postedDate: new Date().toISOString().split("T")[0],
    };
    set(state => ({ workPosts: [newPost, ...state.workPosts] }));
  },

  applyToWork: (application) => {
    const id = `app-${Date.now()}`;
    const newApp: Application = {
      ...application,
      id,
      status: "pending",
      appliedDate: new Date().toISOString().split("T")[0],
    };
    set(state => ({
      applications: [...state.applications, newApp],
      notifications: [...state.notifications, {
        id: `notif-${Date.now()}`,
        userId: get().workPosts.find(w => w.id === application.workId)?.postedBy || "",
        type: "application" as const,
        message: `New application received for your work post`,
        read: false,
        date: new Date().toISOString().split("T")[0],
      }],
    }));
  },

  acceptApplication: (applicationId) => {
    const app = get().applications.find(a => a.id === applicationId);
    set(state => ({
      applications: state.applications.map(a =>
        a.id === applicationId ? { ...a, status: "accepted" as const } : a
      ),
      notifications: [...state.notifications, {
        id: `notif-${Date.now()}`,
        userId: app?.applicantId || "",
        type: "accepted" as const,
        message: "Your application has been accepted!",
        read: false,
        date: new Date().toISOString().split("T")[0],
      }],
    }));
  },

  rejectApplication: (applicationId) => {
    const app = get().applications.find(a => a.id === applicationId);
    set(state => ({
      applications: state.applications.map(a =>
        a.id === applicationId ? { ...a, status: "rejected" as const } : a
      ),
      notifications: [...state.notifications, {
        id: `notif-${Date.now()}`,
        userId: app?.applicantId || "",
        type: "rejected" as const,
        message: "Your application has been rejected.",
        read: false,
        date: new Date().toISOString().split("T")[0],
      }],
    }));
  },

  completeWork: (applicationId, rating, reviewComment) => {
    const app = get().applications.find(a => a.id === applicationId);
    if (!app) return;
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const work = get().workPosts.find(w => w.id === app.workId);
    const isPostOwner = work?.postedBy === currentUser.id;
    const targetUserId = isPostOwner ? app.applicantId : (work?.postedBy || "");

    set(state => ({
      applications: state.applications.map(a =>
        a.id === applicationId ? { ...a, status: "completed" as const } : a
      ),
      reviews: [...state.reviews, {
        id: `rev-${Date.now()}`,
        fromUserId: currentUser.id,
        toUserId: targetUserId,
        workId: app.workId,
        rating,
        comment: reviewComment,
        date: new Date().toISOString().split("T")[0],
      }],
      users: state.users.map(u => {
        if (u.id === targetUserId) {
          const newTotalRatings = u.totalRatings + 1;
          const newRating = ((u.rating * u.totalRatings) + rating) / newTotalRatings;
          return { ...u, rating: Math.round(newRating * 10) / 10, totalRatings: newTotalRatings, completedWorks: u.completedWorks + 1 };
        }
        return u;
      }),
    }));
  },

  sendMessage: (receiverId, content) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    set(state => ({ messages: [...state.messages, msg] }));
  },

  markMessagesRead: (otherUserId) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    set(state => ({
      messages: state.messages.map(m =>
        m.senderId === otherUserId && m.receiverId === currentUser.id ? { ...m, read: true } : m
      ),
    }));
  },

  getChatThreads: () => {
    const currentUser = get().currentUser;
    if (!currentUser) return [];
    const msgs = get().messages;
    const threadMap = new Map<string, ChatThread>();

    msgs.forEach(m => {
      if (m.senderId !== currentUser.id && m.receiverId !== currentUser.id) return;
      const otherId = m.senderId === currentUser.id ? m.receiverId : m.senderId;
      const existing = threadMap.get(otherId);
      if (!existing || new Date(m.timestamp) > new Date(existing.lastTimestamp)) {
        const unread = msgs.filter(msg => msg.senderId === otherId && msg.receiverId === currentUser.id && !msg.read).length;
        threadMap.set(otherId, {
          participantId: otherId,
          lastMessage: m.content,
          lastTimestamp: m.timestamp,
          unreadCount: unread,
        });
      }
    });

    return Array.from(threadMap.values()).sort((a, b) =>
      new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );
  },

  submitReport: (report) => {
    const newReport: Report = {
      ...report,
      id: `report-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    set(state => ({ reports: [...state.reports, newReport] }));
  },

  updateProfile: (data) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    set(state => ({
      currentUser: updated,
      users: state.users.map(u => u.id === currentUser.id ? updated : u),
    }));
  },

  markNotificationRead: (notifId) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === notifId ? { ...n, read: true } : n),
    }));
  },

  getUserById: (id) => get().users.find(u => u.id === id),
  getWorkById: (id) => get().workPosts.find(w => w.id === id),
}));
