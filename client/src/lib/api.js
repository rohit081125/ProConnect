const BASE_URL = "http://localhost:8080";

export async function apiRequest(endpoint, method = "GET", body = null, customHeaders = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...customHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    const isFormData = body instanceof FormData;

    if (isFormData) {
      options.body = body;
    } else {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, options);
  } catch (error) {
    throw new Error("Backend connection failed");
  }

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }

  return data;
}

/* =========================
   AUTH APIs
========================= */

export const signupUser = (userData) =>
  apiRequest("/api/auth/signup", "POST", userData);

export const loginUser = (loginData) =>
  apiRequest("/api/auth/login", "POST", loginData);

/* =========================
   PROFILE APIs
========================= */

export const getUserProfile = (userId) =>
  apiRequest(`/api/users/${userId}`, "GET");

export const updateUserProfile = (userId, profileData) =>
  apiRequest(`/api/users/${userId}`, "PUT", profileData);

export const uploadProfileImage = (userId, file) => {
  const formData = new FormData();
  formData.append("image", file);

  return apiRequest(`/api/users/${userId}/profile-image`, "PUT", formData);
};

/* =========================
   WORK APIs
========================= */

export const createWork = (workData) =>
  apiRequest("/api/works/create", "POST", workData);

export const getAllWorks = () =>
  apiRequest("/api/works", "GET");

export const getWorkById = (workId) =>
  apiRequest(`/api/works/${workId}`, "GET");

export const getWorksByUser = (userId) =>
  apiRequest(`/api/works/user/${userId}`, "GET");

export const deleteWork = (workId) =>
  apiRequest(`/api/works/${workId}`, "DELETE");

/* =========================
   APPLICATION APIs
========================= */

export const createApplication = (applicationData) =>
  apiRequest("/api/applications", "POST", applicationData);

export const getApplicationsByWork = (workId) =>
  apiRequest(`/api/applications/work/${workId}`, "GET");

export const getApplicationsByApplicant = (applicantId) =>
  apiRequest(`/api/applications/applicant/${applicantId}`, "GET");

export const acceptApplication = (applicationId) =>
  apiRequest(`/api/applications/${applicationId}/accept`, "PATCH");

export const rejectApplication = (applicationId) =>
  apiRequest(`/api/applications/${applicationId}/reject`, "PATCH");

export const requestCompletion = (applicationId, clientId) =>
  apiRequest(
    `/api/applications/${applicationId}/request-completion?clientId=${clientId}`,
    "PATCH"
  );

export const acceptCompletion = (applicationId, freelancerId) =>
  apiRequest(
    `/api/applications/${applicationId}/accept-completion?freelancerId=${freelancerId}`,
    "PATCH"
  );

export const rejectCompletion = (applicationId, freelancerId) =>
  apiRequest(
    `/api/applications/${applicationId}/reject-completion?freelancerId=${freelancerId}`,
    "PATCH"
  );

export const deleteApplication = (applicationId) =>
  apiRequest(`/api/applications/${applicationId}`, "DELETE");

/* =========================
   DASHBOARD API
========================= */

export const getDashboardData = (userId) =>
  apiRequest(`/api/dashboard/${userId}`, "GET");

/* =========================
   CHAT APIs
========================= */

export const sendMessage = (messageData) =>
  apiRequest("/api/chat", "POST", messageData);

export const getMessages = (user1, user2) =>
  apiRequest(`/api/chat/${user1}/${user2}`, "GET");

export const markMessagesAsRead = (senderId, receiverId) =>
  apiRequest(`/api/chat/read?senderId=${senderId}&receiverId=${receiverId}`, "PATCH");

export const uploadChatFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiRequest("/api/chat/upload", "POST", formData);
  return response?.url || "";
};

/* =========================
   NOTIFICATION APIs
========================= */

export const getNotifications = (userId) =>
  apiRequest(`/api/notifications/${userId}`, "GET");

export const getUnreadNotificationCount = (userId) =>
  apiRequest(`/api/notifications/unread-count/${userId}`, "GET");

export const markNotificationAsRead = (notificationId) =>
  apiRequest(`/api/notifications/mark-read/${notificationId}`, "PUT");

export const markAllNotificationsAsRead = (userId) =>
  apiRequest(`/api/notifications/mark-all-read/${userId}`, "PUT");

/* =========================
   REPORT APIs
========================= */

export const createReport = (reportData) =>
  apiRequest("/api/reports", "POST", reportData);

/* =========================
   REVIEW APIs
========================= */

export const createReview = (reviewData) =>
  apiRequest("/api/reviews", "POST", reviewData);

export const getReviewsByUser = (userId) =>
  apiRequest(`/api/reviews/user/${userId}`, "GET");

export const getReviewSummaryByUser = (userId) =>
  apiRequest(`/api/reviews/user/${userId}/summary`, "GET");