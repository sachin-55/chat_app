export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  password: string;
  lastSeen?: string;
  isOnline: boolean;
}
export const CHAT_STATUS = Object.freeze({
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
});
export type ChatStatus = (typeof CHAT_STATUS)[keyof typeof CHAT_STATUS];

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text?: string;
  replyTo?: string;
  status?: ChatStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface Conversation {
  _id: string;
  participantIds: string[];
  participants?: User[];
  lastMessageId: string;
  lastMessage?: Message;
  roomName?: string;
  unreadCounts?: Record<string, number>;
  updatedAt: string;
}

export interface AuthResponse {
  data: User;
}
export type PaginationType = {
  page?: number;
  limit: number;
  results?: number;
  totalPages?: number;
  totalResults?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  nextCursor?: string | null;
  hasMore?: boolean;
};

export interface ConversationListResponse {
  data: Conversation[];
  pagination: Pick<
    PaginationType,
    "totalResults" | "page" | "limit" | "totalPages" | "results"
  >;
}

export interface MessageResponse {
  data: Message[];
  pagination: Pick<PaginationType, "limit" | "hasMore" | "nextCursor">;
}

export interface UserResponse {
  data: User[];
  pagination: Pick<
    PaginationType,
    "totalResults" | "page" | "limit" | "totalPages" | "results"
  >;
}
