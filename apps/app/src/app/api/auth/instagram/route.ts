import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildInstagramAuthUrl } from "@pilot/instagram";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_RETURN_TO_COOKIE = "pilot_instagram_return_to";

function normalizeReturnTo(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/settings";
  }

  try {
    const url = new URL(value, "http://pilot.local");
    if (url.origin !== "http://pilot.local") {
      return "/settings";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/settings";
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();
  cookieStore.set(
    INSTAGRAM_RETURN_TO_COOKIE,
    normalizeReturnTo(searchParams.get("returnTo")),
    {
      httpOnly: true,
      maxAge: 60 * 10,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  const redirectUri = new URL(
    "/api/auth/instagram/callback",
    request.url,
  ).toString();
  console.log(
    "Starting Instagram authentication flow with redirect URI:",
    redirectUri,
  );
  const authUrl = buildInstagramAuthUrl({
    clientId: INSTAGRAM_CLIENT_ID!,
    redirectUri,
  });
  console.log("Instagram authorize URL:", authUrl);

  return NextResponse.redirect(authUrl);
}
