const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://incontrol-lite-pb.onrender.com";

interface ApiError extends Error {
  status?: number;
  data?: any;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
    ...options,
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch {
  }

  if (!res.ok) {
    const error: ApiError = new Error(
      data?.detail || "Request failed"
    );
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const apiClient = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: any) =>
    request<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(url: string, body?: any) =>
    request<T>(url, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(url: string) =>
    request<T>(url, { method: "DELETE" }),
};
