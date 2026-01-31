/**
 * API env config.
 */
function getEnv(key: string, fallback: string): string {
  if (typeof process === "undefined") return fallback;
  return process.env[key] ?? fallback;
}

export const apiEnv = {
  baseUrl: getEnv(
    "NEXT_PUBLIC_API_BASE_URL",
    "http://127.0.0.1:8000/api/v1"
  ).replace(/\/$/, ""),
} as const;

/** Full API root URL: baseUrl (e.g. .../api/v1) */
export function getApiRoot(): string {
  const { baseUrl } = apiEnv;
  return baseUrl;
}
