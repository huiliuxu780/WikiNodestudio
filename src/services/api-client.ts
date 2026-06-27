const defaultBaseUrl = "/api"

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`API request failed with status ${status}`)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

export function isMockFallbackEnabled() {
  return import.meta.env.VITE_USE_MOCK_FALLBACK === "true"
}

export function withMockFallback<T>(request: Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  if (!isMockFallbackEnabled()) {
    return request
  }

  return request.catch(fallback)
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
}

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
  return (configuredBaseUrl?.trim() || defaultBaseUrl).replace(/\/$/, "")
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${getApiBaseUrl()}${normalizedPath}`
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    return response.json()
  }

  const text = await response.text()
  return text || null
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const body = await readResponseBody(response)
  if (!response.ok) {
    throw new ApiError(response.status, body)
  }

  return body as T
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  })

  const body = await readResponseBody(response)
  if (!response.ok) {
    throw new ApiError(response.status, body)
  }

  return body as T
}

export function apiGet<T>(path: string) {
  return apiRequest<T>(path)
}

export function apiPost<T>(path: string, body: unknown) {
  return apiRequest<T>(path, { method: "POST", body })
}

export function apiPut<T>(path: string, body: unknown) {
  return apiRequest<T>(path, { method: "PUT", body })
}

export function apiPatch<T>(path: string, body: unknown) {
  return apiRequest<T>(path, { method: "PATCH", body })
}

export function apiDelete<T>(path: string) {
  return apiRequest<T>(path, { method: "DELETE" })
}
