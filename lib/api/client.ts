/**
 * Generic API client for making fetch requests with error handling.
 *
 * Automatically unwraps the ApiResponse envelope so callers receive
 * `data` directly (e.g. `items` instead of `response.data.items`).
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
      const errorBody = (await res.json()) as { error?: string };
      errorMessage = errorBody.error || `Request failed with status ${res.status}`;
    } catch {
      errorMessage = `Request failed with status ${res.status}`;
    }

    throw new Error(errorMessage);
  }

  const body = (await res.json()) as { ok: boolean; data?: T; error?: string };

  // If the response follows the ApiResponse envelope, unwrap it automatically.
  if (body && typeof body === "object" && "ok" in body) {
    if (body.ok) {
      return body.data as T;
    }
    throw new Error(body.error || "Request failed");
  }

  return body as unknown as T;
}


