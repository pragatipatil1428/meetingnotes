import type { ApiResponse } from "@/lib/types";

/**
 * Generic API client for making fetch requests with error handling.
 */
export async function api<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!res.ok) {
    let errorMessage: string;
    try {
      const errorBody = await res.json();
      errorMessage =
        (errorBody as { error?: string }).error ||
        `Request failed with status ${res.status}`;
    } catch {
      errorMessage = `Request failed with status ${res.status}`;
    }

    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
}

/**
 * Wrapper for server action responses with typed data.
 */
export async function handleActionResponse<T>(
  response: ApiResponse<T>
): Promise<T> {
  if (!response.ok) {
    throw new Error(response.error || "Action failed");
  }
  return response.data as T;
}
