export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  username: string;
  photo: string;
  bio: string;
  skills: string[];
  location: string;
  portfolioLinks: string[];
  socialLinks: string[];
  education: string;
  experience: string;
  rating: number;
  totalRatings: number;
  completedWorks: number;
  joinedDate: string;
}

export interface WorkPost {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  detailedDescription: string;
  skills: string[];
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  urgency: "low" | "medium" | "high";
  workType: "remote" | "onsite" | "hybrid";
  location: string;
  postedBy: string;
  postedDate: string;
}

export interface Application {
  id: string;
  workId: string;
  applicantId: string;
  proposalMessage: string;
  referenceLink: string;
  skillsUsed: string[];
  estimatedTime: string;
  counterPrice: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  appliedDate: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ChatThread {
  participantId: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  workId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  workId: string;
  reason: string;
  description: string;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "application" | "accepted" | "rejected" | "message" | "completed";
  message: string;
  read: boolean;
  date: string;
}
