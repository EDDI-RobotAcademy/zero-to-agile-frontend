"use client";

/**
 * Thin client utilities for talking to the backend auth endpoints.
 * - Refresh 토큰은 HttpOnly 쿠키로만 접근 가능하므로 항상 credentials: 'include'를 사용합니다.
 * - Access Token은 메모리/상태에 보관하고 Authorization 헤더로 붙입니다.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getApiBase(): string {
  // 백엔드 기본 포트: 33333 (env를 덮어쓸 수 있음)
  const base = API_BASE_URL || "http://localhost:33333";
  return `${base}/api`;
}

function withApiBase(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${getApiBase()}${path}`;
}

export function redirectToGoogleLogin(userType: "finder" | "owner") {
  const url = `${withApiBase("/auth/google")}?user_type=${userType}`;
  // 서버 리다이렉트로 OAuth 플로우 진입
  window.location.href = url;
}

export async function requestAccessTokenWithRefresh(): Promise<string | null> {
  try {
    const res = await fetch(withApiBase("/auth/token/refresh"), {
      method: "POST",
      credentials: "include", // refresh_token 쿠키 사용
    });

    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.access_token === "string" ? data.access_token : null;
  } catch (err) {
    console.error("failed to refresh access token", err);
    return null;
  }
}

export async function logoutFromServer() {
  try {
    await fetch(withApiBase("/auth/logout"), {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("failed to logout", err);
  } finally {
    // 서버 삭제에 실패하더라도 클라이언트 쿠키를 만료시켜 새 토큰 발급을 막는다.
    if (typeof document !== "undefined") {
      document.cookie = "refresh_token=; path=/auth; max-age=0";
    }
  }
}

export async function authFetch(
    pathOrUrl: string,
    init: RequestInit = {},
    accessToken?: string | null,
) {
  // [ADD] 호출부에서 /api를 매번 붙이지 않도록 전역 프리픽스(prefix) 적용
  // - 절대 URL(http/https)은 그대로 사용
  // - 이미 /api로 시작하면 중복 방지
  const API_PREFIX = "/api";

  const normalizeApiPath = (p: string) => {
    if (p.startsWith("http://") || p.startsWith("https://")) return p;

    const normalized = p.startsWith("/") ? p : `/${p}`;

    if (normalized === API_PREFIX || normalized.startsWith(`${API_PREFIX}/`)) {
      return normalized;
    }

    return `${API_PREFIX}${normalized}`;
  };

  const headers = new Headers(init.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // [CHANGE] withApiBase 호출 전에 normalizeApiPath 적용
  return fetch(withApiBase(normalizeApiPath(pathOrUrl)), {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });
}
