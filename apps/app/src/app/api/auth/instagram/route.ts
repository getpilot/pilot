import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildInstagramAuthUrl } from "@pilot/instagram";
import {
  getInstagramCallbackUrl,
  normalizeInstagramReturnTo,
} from "@/lib/instagram-auth";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_RETURN_TO_COOKIE = "pilot_instagram_return_to";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();
  cookieStore.set(
    INSTAGRAM_RETURN_TO_COOKIE,
    normalizeInstagramReturnTo(searchParams.get("returnTo")),
    {
      httpOnly: true,
      maxAge: 60 * 10,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  const redirectUri = getInstagramCallbackUrl(request);
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
