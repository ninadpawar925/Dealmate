// src/store/index.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const getInitialThemeMode = () => 'light'; // Default to light

const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null, user: null, isLoggedIn: false, themeMode: getInitialThemeMode(),
            login: (token, userData) => set({ token, user: userData, isLoggedIn: true }),
            logout: () => set({ token: null, user: null, isLoggedIn: false, themeMode: 'light' }), // Reset theme on logout
            setUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
            setThemeMode: (mode) => { if (mode === 'light' || mode === 'dark') { set({ themeMode: mode }); } },
            _checkAuthStatus: () => set((state) => ({ isLoggedIn: !!state.token }))
        }),
        {
            name: 'dealmate-auth-storage', storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ token: state.token, user: state.user, themeMode: state.themeMode }),
            onRehydrateStorage: () => (state) => { state?._checkAuthStatus(); }
        }
    )
);
useAuthStore.getState()._checkAuthStatus();
export default useAuthStore;