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
  return base;
}

function withApiBase(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${getApiBase()}${path}`;
}

export function redirectToGoogleLogin(userType: "tenant" | "landlord") {
  const url = `${withApiBase("/authentication/google")}?user_type=${userType}`;
  // 서버 리다이렉트로 OAuth 플로우 진입
  window.location.href = url;
}

export async function requestAccessTokenWithRefresh(): Promise<string | null> {
  try {
    const res = await fetch(withApiBase("/authentication/token/refresh"), {
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
    await fetch(withApiBase("/authentication/logout"), {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("failed to logout", err);
  } finally {
    // 서버 삭제에 실패하더라도 클라이언트 쿠키를 만료시켜 새 토큰 발급을 막는다.
    if (typeof document !== "undefined") {
      document.cookie = "refresh_token=; path=/authentication; max-age=0";
    }
  }
}

export async function authFetch(
  pathOrUrl: string,
  init: RequestInit = {},
  accessToken?: string | null,
) {
  const headers = new Headers(init.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(withApiBase(pathOrUrl), {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });
}
