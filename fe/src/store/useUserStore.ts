import { create } from "zustand";
import type { PaginationType, User, UserResponse } from "../types";
import api from "../api/axios";

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: (
    params?: {
      limit?: number;
      page?: number;
      search?: string;
    },
    signal?: AbortSignal,
  ) => Promise<void>;
  userPagination: Pick<
    PaginationType,
    "totalResults" | "page" | "limit" | "totalPages" | "results" | "hasMore"
  >;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,
  userPagination: { limit: 20, page: 1 },

  fetchUsers: async ({ limit, page, search }, signal) => {
    set({ isLoading: true, error: null });
    try {
      const users = (await api.get("/users", {
        params: { limit, page, search },
        signal,
      })) as UserResponse;

      const { data, pagination } = users;

      if (pagination.page === 1) {
        set({ users: data, userPagination: pagination, isLoading: false });
      } else {
        set((state) => ({
          users: [...state.users, ...data],
          userPagination: pagination,
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error.message || "Failed to fetch users",
        isLoading: false,
      });
    }
  },
}));
