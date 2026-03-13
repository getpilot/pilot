const APP_URL =
  process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? null;

export function normalizeInstagramReturnTo(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/settings";
  }

  try {
    // Placeholder origin used only to parse a relative in-app return path safely.
    const url = new URL(value, "http://localhost.invalid");
    if (url.origin !== "http://localhost.invalid") {
      return "/settings";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/settings";
  }
}

export function getInstagramAppBaseUrl(request: Request) {
  return APP_URL ? APP_URL.replace(/\/$/, "") : new URL(request.url).origin;
}

export function getInstagramCallbackUrl(request: Request) {
  return new URL(
    "/api/auth/instagram/callback",
    getInstagramAppBaseUrl(request),
  ).toString();
}
