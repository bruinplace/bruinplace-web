export const apiEnv = {
  baseUrl: (
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1"
  ).replace(/\/$/, ""),
} as const;

/** Full API root URL: baseUrl (e.g. .../api/v1) */
export function getApiRoot(): string {
  const { baseUrl } = apiEnv;
  return baseUrl;
}

export function getAuthLoginUrl(): string {
  return `${getApiRoot()}/auth/login`;
}
