import { create } from "zustand";
import {
  dummyUsers,
  dummyWorkPosts,
  dummyApplications,
  dummyMessages,
  dummyReviews,
  dummyNotifications,
} from "./dummy-data";

const savedUser = localStorage.getItem("user");
const savedUserId = localStorage.getItem("userId");

const parsedUser = savedUser ? JSON.parse(savedUser) : null;
const savedAuth =
  localStorage.getItem("isAuthenticated") === "true" &&
  (!!parsedUser || !!savedUserId);

export const useStore = create((set, get) => ({
  currentUser: parsedUser,
  currentUserId: savedUserId || null,
  isAuthenticated: savedAuth,

  users: [...dummyUsers],
  workPosts: [...dummyWorkPosts],
  applications: [...dummyApplications],
  messages: [...dummyMessages],
  reviews: [...dummyReviews],
  reports: [],
  notifications: [...dummyNotifications],

  signup: (name, email, password) => {
    const existing = get().users.find((u) => u.email === email);
    if (existing) return "";

    const id = `user-${Date.now()}`;
    const username = name.toLowerCase().replace(/\s+/g, "");

    const newUser = {
      id,
      name,
      email,
      password,
      username,
      photo: "",
      profileImage: "",
      bio: "",
      skills: [],
      location: "",
      portfolioLinks: [],
      socialLinks: [],
      education: "",
      experience: "",
      rating: 0,
      totalRatings: 0,
      completedWorks: 0,
      joinedDate: new Date().toISOString().split("T")[0],
    };

    set((state) => ({
      users: [...state.users, newUser],
    }));

    return id;
  },

  setupProfile: (userId, data) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId
          ? {
              ...u,
              ...data,
            }
          : u
      ),
      currentUser:
        state.currentUser?.id === userId || state.currentUser?._id === userId
          ? {
              ...state.currentUser,
              ...data,
            }
          : state.currentUser,
      isAuthenticated: true,
    }));

    const updatedCurrentUser = {
      ...get().currentUser,
      ...data,
    };

    if (updatedCurrentUser) {
      localStorage.setItem("user", JSON.stringify(updatedCurrentUser));
      localStorage.setItem("userId", userId);
      localStorage.setItem("isAuthenticated", "true");

      set({
        currentUser: updatedCurrentUser,
        currentUserId: userId,
      });
    }
  },

  login: (...args) => {
    if (args.length === 1 && typeof args[0] === "object") {
      const responseData = args[0];

      const user =
        responseData.user ||
        responseData.data ||
        responseData.profile ||
        responseData;

      const userId =
        responseData.userId ||
        user?._id ||
        user?.id ||
        user?.userId ||
        localStorage.getItem("userId") ||
        null;

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      if (userId) {
        localStorage.setItem("userId", userId);
      }

      localStorage.setItem("isAuthenticated", "true");

      set({
        currentUser: user || null,
        currentUserId: userId,
        isAuthenticated: true,
      });

      return true;
    }

    if (args.length === 2) {
      const [email, password] = args;
      const user = get().users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user.id);
        localStorage.setItem("isAuthenticated", "true");

        set({
          currentUser: user,
          currentUserId: user.id,
          isAuthenticated: true,
        });

        return true;
      }

      return false;
    }

    return false;
  },

  setUser: (user) => {
    const userId = user?._id || user?.id || user?.userId || null;

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    if (userId) {
      localStorage.setItem("userId", userId);
    }

    set({
      currentUser: user,
      currentUserId: userId,
    });
  },

  setIsAuthenticated: (value) => {
    localStorage.setItem("isAuthenticated", value ? "true" : "false");

    set({
      isAuthenticated: value,
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAuthenticated");

    set({
      currentUser: null,
      currentUserId: null,
      isAuthenticated: false,
    });
  },

  addWorkPost: (post) => {
    const id = `work-${Date.now()}`;
    const newPost = {
      ...post,
      id,
      postedDate: new Date().toISOString().split("T")[0],
    };

    set((state) => ({
      workPosts: [newPost, ...state.workPosts],
    }));
  },

  applyToWork: (application) => {
    const id = `app-${Date.now()}`;
    const newApp = {
      ...application,
      id,
      status: "pending",
      appliedDate: new Date().toISOString().split("T")[0],
    };

    set((state) => ({
      applications: [...state.applications, newApp],
      notifications: [
        ...state.notifications,
        {
          id: `notif-${Date.now()}`,
          userId:
            get().workPosts.find((w) => w.id === application.workId)?.postedBy ||
            "",
          type: "application",
          message: `New application received for your work post`,
          read: false,
          date: new Date().toISOString().split("T")[0],
        },
      ],
    }));
  },

  acceptApplication: (applicationId) => {
    const app = get().applications.find((a) => a.id === applicationId);

    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: "accepted",
            }
          : a
      ),
      notifications: [
        ...state.notifications,
        {
          id: `notif-${Date.now()}`,
          userId: app?.applicantId || "",
          type: "accepted",
          message: "Your application has been accepted!",
          read: false,
          date: new Date().toISOString().split("T")[0],
        },
      ],
    }));
  },

  rejectApplication: (applicationId) => {
    const app = get().applications.find((a) => a.id === applicationId);

    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: "rejected",
            }
          : a
      ),
      notifications: [
        ...state.notifications,
        {
          id: `notif-${Date.now()}`,
          userId: app?.applicantId || "",
          type: "rejected",
          message: "Your application has been rejected.",
          read: false,
          date: new Date().toISOString().split("T")[0],
        },
      ],
    }));
  },

  completeWork: (applicationId, rating, reviewComment) => {
    const app = get().applications.find((a) => a.id === applicationId);
    if (!app) return;

    const currentUser = get().currentUser;
    if (!currentUser) return;

    const work = get().workPosts.find((w) => w.id === app.workId);
    const currentUserId = currentUser._id || currentUser.id;

    const isPostOwner = work?.postedBy === currentUserId;
    const targetUserId = isPostOwner ? app.applicantId : work?.postedBy || "";

    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: "completed",
            }
          : a
      ),
      reviews: [
        ...state.reviews,
        {
          id: `rev-${Date.now()}`,
          fromUserId: currentUserId,
          toUserId: targetUserId,
          workId: app.workId,
          rating,
          comment: reviewComment,
          date: new Date().toISOString().split("T")[0],
        },
      ],
      users: state.users.map((u) => {
        if (u.id === targetUserId) {
          const newTotalRatings = u.totalRatings + 1;
          const newRating = (u.rating * u.totalRatings + rating) / newTotalRatings;

          return {
            ...u,
            rating: Math.round(newRating * 10) / 10,
            totalRatings: newTotalRatings,
            completedWorks: u.completedWorks + 1,
          };
        }
        return u;
      }),
    }));
  },

  sendMessage: (receiverId, content) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const senderId = currentUser._id || currentUser.id;

    const msg = {
      id: `msg-${Date.now()}`,
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    set((state) => ({
      messages: [...state.messages, msg],
    }));
  },

  markMessagesRead: (otherUserId) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const currentUserId = currentUser._id || currentUser.id;

    set((state) => ({
      messages: state.messages.map((m) =>
        m.senderId === otherUserId && m.receiverId === currentUserId
          ? {
              ...m,
              read: true,
            }
          : m
      ),
    }));
  },

  getChatThreads: () => {
    const currentUser = get().currentUser;
    if (!currentUser) return [];

    const currentUserId = currentUser._id || currentUser.id;
    const msgs = get().messages;
    const threadMap = new Map();

    msgs.forEach((m) => {
      if (m.senderId !== currentUserId && m.receiverId !== currentUserId) return;

      const otherId = m.senderId === currentUserId ? m.receiverId : m.senderId;
      const existing = threadMap.get(otherId);

      if (!existing || new Date(m.timestamp) > new Date(existing.lastTimestamp)) {
        const unread = msgs.filter(
          (msg) =>
            msg.senderId === otherId &&
            msg.receiverId === currentUserId &&
            !msg.read
        ).length;

        threadMap.set(otherId, {
          participantId: otherId,
          lastMessage: m.content,
          lastTimestamp: m.timestamp,
          unreadCount: unread,
        });
      }
    });

    return Array.from(threadMap.values()).sort(
      (a, b) =>
        new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );
  },

  submitReport: (report) => {
    const newReport = {
      ...report,
      id: `report-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };

    set((state) => ({
      reports: [...state.reports, newReport],
    }));
  },

  updateProfile: (data) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const currentUserId = currentUser._id || currentUser.id;

    const updated = {
      ...currentUser,
      ...data,
    };

    localStorage.setItem("user", JSON.stringify(updated));

    set((state) => ({
      currentUser: updated,
      users: state.users.map((u) =>
        u.id === currentUserId ? updated : u
      ),
    }));
  },

  markNotificationRead: (notifId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notifId
          ? {
              ...n,
              read: true,
            }
          : n
      ),
    }));
  },

  getUserById: (id) => get().users.find((u) => u.id === id),
  getWorkById: (id) => get().workPosts.find((w) => w.id === id),
}));