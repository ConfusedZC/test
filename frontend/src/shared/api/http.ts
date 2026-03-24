const DEFAULT_API_BASE_URL = "/api";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (typeof configured === "string" && configured.trim()) {
    return configured.replace(/\/+$/, "");
  }
  return DEFAULT_API_BASE_URL;
}

function joinUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function buildQueryString(query?: QueryParams) {
  if (!query) {
    return "";
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    searchParams.set(key, String(value));
  }

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const detail = (payload as Record<string, unknown>).detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (first && typeof first === "object") {
        const message = (first as Record<string, unknown>).msg;
        if (typeof message === "string" && message.trim()) {
          return message;
        }
      }
      return "请求失败";
    }
  }

  return fallback;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const rawBody = await response.text();
  const payload = rawBody ? safeJsonParse(rawBody) : undefined;

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload, response.statusText || "Request failed"),
      response.status,
      payload,
    );
  }

  if (!rawBody) {
    return undefined as T;
  }

  return (payload ?? rawBody) as T;
}

function safeJsonParse(rawBody: string) {
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

export async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  let body = init.body;
  if (body !== undefined && body !== null && !(body instanceof FormData) && !(body instanceof Blob)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (typeof body !== "string") {
      body = JSON.stringify(body);
    }
  }

  const response = await fetch(joinUrl(getApiBaseUrl(), path), {
    ...init,
    headers,
    body,
  });

  return parseResponse<T>(response);
}

export async function getJson<T>(path: string, query?: QueryParams, init: RequestInit = {}): Promise<T> {
  return requestJson<T>(`${path}${buildQueryString(query)}`, {
    ...init,
    method: "GET",
  });
}

export async function postJson<T>(path: string, body?: unknown, init: RequestInit = {}): Promise<T> {
  return requestJson<T>(path, {
    ...init,
    method: "POST",
    body: body as BodyInit | null,
  });
}

export async function patchJson<T>(path: string, body?: unknown, init: RequestInit = {}): Promise<T> {
  return requestJson<T>(path, {
    ...init,
    method: "PATCH",
    body: body as BodyInit | null,
  });
}
