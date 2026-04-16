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
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  fetchConversations: (
    params: {
      page?: number;
      limit?: number;
      search?: string;
    },
    signal?: AbortSignal,
  ) => Promise<void>;
  fetchMessages: (
    conversationId: string,
    params?: { cursor?: string; limit?: number },
  ) => Promise<void>;
  conversationPagination: Pick<
    PaginationType,
    "totalResults" | "page" | "limit" | "totalPages" | "results"
  >;
  messagePagination: Pick<PaginationType, "limit" | "hasMore" | "nextCursor">;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  conversationPagination: { limit: 20, page: 1 },
  messagePagination: { limit: 20, hasMore: true, nextCursor: null },

  fetchConversations: async ({ limit, page, search }, signal) => {
    set({ isLoading: true, error: null });
    try {
      const conversations = (await api.get("/conversations", {
        params: { limit, page, search },
        signal,
      })) as ConversationListResponse;

      const { data, pagination } = conversations.data;
      if (pagination.page === 1) {
        set({
          conversations: data,
          isLoading: false,
          conversationPagination: pagination,
        });
      } else {
        set((state) => ({
          conversations: [...state.conversations, ...data].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
          isLoading: false,
          conversationPagination: pagination,
        }));
      }
    } catch (error) {
      set({
        error: error.message || "Failed to fetch conversations",
        isLoading: false,
      });
    }
  },

  fetchMessages: async (conversationId, { cursor, limit }) => {
    set({ isLoading: true, error: null });
    try {
      const messages = (await api.get(
        `/conversations/${conversationId}/messages`,
        { params: { cursor, limit } },
      )) as MessageResponse;

      const { data, pagination } = messages.data;
      if (cursor) {
        set((state) => ({
          messages: [...data, ...state.messages],
          isLoading: false,
          messagePagination: pagination,
        }));
      } else {
        set({
          messages: data,
          isLoading: false,
          messagePagination: pagination,
        });
      }
    } catch (error) {
      set({
        error: error.message || "Failed to fetch messages",
        isLoading: false,
      });
    }
  },
}));
