"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { userStore, UserRole as StoreUserRole } from './userStore';
import { authFetch as baseAuthFetch } from './authClient';

export type UserRole = StoreUserRole;

interface RoleContextValue {
  role: UserRole;
  accessToken: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  isRefreshing: boolean;
  login: (role: Exclude<UserRole, null>) => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  redirectToGoogle: (role: Exclude<UserRole, null>) => void;
  authFetch: typeof baseAuthFetch;
}

const RoleContext = createContext<RoleContextValue>({
  role: null,
  accessToken: null,
  isAuthenticated: false,
  isReady: false,
  isRefreshing: false,
  login: () => {},
  logout: async () => {},
  refreshAccessToken: async () => null,
  redirectToGoogle: () => {},
  authFetch: baseAuthFetch,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(userStore.subscribe, userStore.getState, userStore.getState);

  // 초기화: 클라이언트에서만 호출 (렌더링 중 setState 방지)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (snapshot.isReady || snapshot.isRefreshing) return;
    void userStore.init();
  }, [snapshot.isReady, snapshot.isRefreshing]);

  const value = useMemo(
    () => ({
      role: snapshot.role,
      accessToken: snapshot.accessToken,
      isAuthenticated: snapshot.isAuthenticated,
      isReady: snapshot.isReady,
      isRefreshing: snapshot.isRefreshing,
      login: userStore.login,
      logout: userStore.logout,
      refreshAccessToken: userStore.refreshAccessToken,
      redirectToGoogle: userStore.redirectToGoogle,
      authFetch: userStore.authFetch,
    }),
    [snapshot],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
