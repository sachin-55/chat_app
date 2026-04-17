import { create } from "zustand";
import type {
  Conversation,
  ConversationListResponse,
  Message,
  MessageResponse,
  PaginationType,
} from "../types";
import api from "../api/axios";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: {
    conversation: boolean;
    messages: boolean;
    conversationDetails: boolean;
    download?: boolean;
  };
  error: string | null;
  setActiveConversationId: (id: string) => void;
  setActiveConversation: (conversation: Conversation) => void;
  fetchConversations: (
    params: {
      page?: number;
      limit?: number;
      search?: string;
    },
    signal?: AbortSignal,
  ) => Promise<void>;

  fetchConversationDetails: (conversationId: string) => Promise<void>;

  fetchMessages: (
    conversationId: string,
    params?: { cursor?: string; limit?: number },
    signal?: AbortSignal,
  ) => Promise<void>;
  conversationPagination: Pick<
    PaginationType,
    "totalResults" | "page" | "limit" | "totalPages" | "results"
  >;
  messagePagination: Pick<PaginationType, "limit" | "hasMore" | "nextCursor">;
  updateConversation: (conversation: Conversation) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  exportConversation: (
    conversationId: string,
    type: "csv" | "json",
  ) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: {
    conversation: false,
    messages: false,
    conversationDetails: false,
  },
  activeConversation: null,
  error: null,
  conversationPagination: { limit: 20, page: 1 },
  messagePagination: { limit: 20, hasMore: true, nextCursor: null },
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setActiveConversation: (conversation) =>
    set({ activeConversation: conversation }),
  fetchConversations: async ({ limit, page, search }, signal) => {
    set({ isLoading: { ...get().isLoading, conversation: true }, error: null });
    try {
      const conversations = (await api.get("/conversations", {
        params: { limit, page, search },
        signal,
      })) as ConversationListResponse;

      const { data, pagination } = conversations;
      if (pagination.page === 1) {
        set({
          conversations: data,
          isLoading: { ...get().isLoading, conversation: false },
          conversationPagination: pagination,
        });
      } else {
        set((state) => ({
          conversations: [...state.conversations, ...data].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
          isLoading: { ...get().isLoading, conversation: false },
          conversationPagination: pagination,
        }));
      }
    } catch (error) {
      set({
        error: error.message || "Failed to fetch conversations",
        isLoading: { ...get().isLoading, conversation: false },
      });
    }
  },

  fetchMessages: async (conversationId, { cursor, limit }, signal) => {
    set({ isLoading: { ...get().isLoading, messages: true }, error: null });
    try {
      const messages = (await api.get(
        `/conversations/${conversationId}/messages`,
        { params: { cursor, limit }, signal },
      )) as MessageResponse;

      const { data, pagination } = messages;
      if (cursor) {
        set((state) => ({
          messages: [...data, ...state.messages],
          isLoading: { ...get().isLoading, messages: false },
          messagePagination: pagination,
        }));
      } else {
        set({
          messages: data,
          isLoading: { ...get().isLoading, messages: false },
          messagePagination: pagination,
        });
      }
    } catch (error) {
      set({
        error: error.message || "Failed to fetch messages",
        isLoading: { ...get().isLoading, messages: false },
      });
    }
  },
  fetchConversationDetails: async (conversationId) => {
    set({
      isLoading: { ...get().isLoading, conversationDetails: true },
      error: null,
    });
    try {
      const conversation = (await api.get(
        `/conversations/${conversationId}`,
      )) as { data: Conversation };

      set({
        activeConversationId: conversationId,
        activeConversation: conversation.data,
        isLoading: { ...get().isLoading, conversationDetails: false },
      });
    } catch (error) {
      set({
        error: error.message || "Failed to fetch conversation details",
        isLoading: { ...get().isLoading, conversationDetails: false },
      });
    }
  },
  updateConversation: (conversation) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversation._id ? { ...c, ...conversation } : c,
      ),
    }));
  },
  addMessage: (message) => {
    const { activeConversationId } = get();
    if (message.conversationId !== activeConversationId) return;
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
  updateMessage: (message) => {
    const { activeConversationId } = get();
    if (message.conversationId !== activeConversationId) return;
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === message._id ? message : m,
      ),
    }));
  },
  exportConversation: async (conversationId, type) => {
    set({ isLoading: { ...get().isLoading, download: true }, error: null });
    try {
      const response = await api.get(
        `/conversations/${conversationId}/export/${type}`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `conversation-${conversationId}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      set({ isLoading: { ...get().isLoading, download: false } });
    } catch (error) {
      set({
        error: error.message || "Failed to export conversation",
        isLoading: { ...get().isLoading, download: false },
      });
    }
  },
}));
