"use client";

import {
  authFetch,
  logoutFromServer,
  requestAccessTokenWithRefresh,
  redirectToGoogleLogin,
} from "./authClient";

export type UserRole = "tenant" | "landlord" | null;

type State = {
  role: UserRole;
  accessToken: string | null;
  isAuthenticated: boolean;
  isRefreshing: boolean;
  isReady: boolean;
};

type Listener = () => void;

let state: State = {
  role: null,
  accessToken: null,
  isAuthenticated: false,
  isRefreshing: false,
  isReady: false,
};

const listeners = new Set<Listener>();

function setState(patch: Partial<State>) {
  state = {
    ...state,
    ...patch,
    isAuthenticated:
      patch.accessToken !== undefined
        ? !!patch.accessToken
        : state.accessToken !== null,
  };
  listeners.forEach((l) => l());
}

// @ts-ignore
export const userStore = {
  getState: () => state,
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  login(role: Exclude<UserRole, null>) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("role", role);
    }
    setState({ role });
  },
  async refreshAccessToken() {
    setState({ isRefreshing: true });
    const token = await requestAccessTokenWithRefresh();
    if (!token) {
      // refresh 실패 시 세션을 초기화해 401 반복 호출을 방지
      setState({ accessToken: null, role: null, isRefreshing: false, isReady: true });
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("role");
      }
    } else {
      setState({ accessToken: token, isRefreshing: false, isReady: true });
    }
    return token;
  },
  async logout() {
    setState({ role: null, accessToken: null, isAuthenticated: false, isRefreshing: false });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("role");
    }
    await logoutFromServer();
  },
  async authFetchWithRefresh(pathOrUrl: string, init: RequestInit = {} , accessToken?: string | null) {
    const makeRequest = (token?: string | null) => authFetch(pathOrUrl, init, token);

    // 1차 시도: 현재 access token 사용
    let res = await makeRequest(state.accessToken);
    if (res.status !== 401) return res;

    // 2차 시도: refresh 후 재요청
    const newToken = await userStore.refreshAccessToken();
    if (!newToken) {
      await userStore.logout();
      throw new Error("UNAUTHENTICATED");
    }

    res = await makeRequest(newToken);
    if (res.status === 401) {
      await userStore.logout();
      throw new Error("UNAUTHENTICATED");
    }
    return res;
  },
  async init() {
    const storedRole =
      typeof window !== "undefined"
        ? window.localStorage.getItem("role")
        : null;
    if (storedRole === "tenant" || storedRole === "landlord") {
      setState({ role: storedRole });
      await userStore.refreshAccessToken();
    }
    // 로그인 정보가 없으면 바로 준비 완료 상태로 둔다
    setState({ isReady: true });
  },
  redirectToGoogle(role: Exclude<UserRole, null>) {
    userStore.login(role);
    redirectToGoogleLogin(role);
  },
  authFetch: (...args: Parameters<typeof authFetch>) =>
    userStore.authFetchWithRefresh(...args),
};
