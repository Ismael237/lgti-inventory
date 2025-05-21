import { create } from 'zustand';
import { executeWithErrorHandling } from '@utils/error';
import type { State } from '@utils/error';
import type { DirectusUser } from '@directus/sdk';
import { userAPI } from '@api/user.api';


type UserStateBase = State<DirectusUser>

interface UserState extends UserStateBase {

    // Actions
    login: (credentials: { email: string; password: string }) => Promise<object>;
    logout: () => Promise<void>;
    fetchCurrentUser: () => Promise<DirectusUser>;
    updateUser: (userData: Partial<DirectusUser>) => Promise<DirectusUser>;
    checkAuthStatus: () => Promise<boolean>;

    // State management helpers
    setLoading: (loading: boolean) => void;
    setError: (error: Error | null) => void;
    resetState: () => void;
}

const initialState: UserStateBase = {
    data: null,
    loading: false,
    error: null,
};

export const useUserStore = create<UserState>()((set) => ({
    ...initialState,

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error }),

    resetState: () => set(initialState),

    login: async (credentials) => {
        return executeWithErrorHandling<DirectusUser>(
            async () => {
                await userAPI.loginUserWithCredentials(credentials);

                return await userAPI.getCurrentUser() as DirectusUser;
            },
            (state) => set({ ...state }),
            initialState
        );
    },

    logout: async () => {
        return executeWithErrorHandling<void>(
            async () => {
                await userAPI.logoutUser();
            },
            () => set({ ...initialState }),
        );
    },

    fetchCurrentUser: async () => {
        return executeWithErrorHandling<DirectusUser>(
            async () => {
                return await userAPI.getCurrentUser() as DirectusUser;
            },
            (state) => set({ ...state }),
            initialState
        );
    },

    updateUser: async (userData) => {
        return executeWithErrorHandling<DirectusUser>(
            async () => {
                await userAPI.updateCurrentUser(userData);
                return await userAPI.getCurrentUser() as DirectusUser;
            },
            (state) => set({ ...state }),
            initialState
        );
    },
    checkAuthStatus: async () => {
        return executeWithErrorHandling<boolean>(
            () => userAPI.isAuthenticated(),
        );
    }
}));