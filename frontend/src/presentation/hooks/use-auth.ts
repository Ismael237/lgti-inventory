import { useCallback } from "react";
import { useUserStore } from "@store/user.store";
import { useTranslation } from "react-i18next";

export enum AuthStatus {
    Unknown = 0,
    Authenticated = 1,
    Guest = 2,
}

export function useAuth() {
    const { t } = useTranslation();
    const {
        data,
        loading,
        error,
        login: storeLogin,
        logout: storeLogout,
        fetchCurrentUser,
        checkAuthStatus,
        updateUser
    } = useUserStore();

    const isLoggedIn = !!data;

    let status = AuthStatus.Unknown;

    if (isLoggedIn) {
        status = AuthStatus.Authenticated;
    } else if (!loading && !isLoggedIn) {
        status = AuthStatus.Guest;
    }

    const authenticate = useCallback(
        async () => {
            try {
                return await fetchCurrentUser();
            } catch (error) {
                console.error(t('auth.errors.authentication_failed'), error);
                return null;
            }
        },
        [fetchCurrentUser, t]
    );

    const login = useCallback(
        async (email: string, password: string): Promise<boolean> => {
            try {
                await storeLogin({ email, password });
                return true;
            } catch (error) {
                console.error(t('auth.errors.login_failed'), error);
                return false;
            }
        },
        [storeLogin, t]
    );

    const logout = useCallback(async () => {
        try {
            await storeLogout();
            return true;
        } catch (error) {
            console.error(t('auth.errors.logout_failed'), error);
            return false;
        }
    }, [storeLogout, t]);

    return {
        user: data,
        error,
        status,
        loading,
        isAuthenticated: isLoggedIn,
        authenticate,
        login,
        logout,
        checkAuthStatus,
        updateUser
    };
}