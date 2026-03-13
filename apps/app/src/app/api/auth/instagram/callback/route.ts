import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { saveInstagramConnection } from "@/actions/instagram";
import {
  exchangeCodeForAccessToken,
  exchangeLongLivedInstagramToken,
  fetchInstagramProfile,
} from "@pilot/instagram";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
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

function buildRedirectUrl(
  request: Request,
  returnTo: string,
  params: Record<string, string>,
) {
  const url = new URL(returnTo, process.env.NEXT_PUBLIC_APP_URL ?? request.url);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

export async function GET(request: Request) {
  const redirectUri = new URL(
    "/api/auth/instagram/callback",
    request.url,
  ).toString();
  const { searchParams } = new URL(request.url);
  const cookieStore = await cookies();
  const returnTo = normalizeReturnTo(
    cookieStore.get(INSTAGRAM_RETURN_TO_COOKIE)?.value ?? null,
  );
  cookieStore.delete(INSTAGRAM_RETURN_TO_COOKIE);
  const code = getRawQueryParam(request.url, "code");
  const error = searchParams.get("error");

  if (error) {
    console.error("Instagram auth error from redirect:", error);
    return NextResponse.redirect(
      buildRedirectUrl(request, returnTo, { error }),
    );
  }

  if (!code) {
    console.error("No code provided in Instagram callback");
    return NextResponse.redirect(
      buildRedirectUrl(request, returnTo, { error: "no_code" }),
    );
  }

  try {
    console.log(
      "Exchanging code for access token with redirect URI:",
      redirectUri,
    );
    const { accessToken, appScopedUserId } = await exchangeCodeForAccessToken({
      clientId: INSTAGRAM_CLIENT_ID!,
      clientSecret: INSTAGRAM_CLIENT_SECRET!,
      redirectUri,
      code,
    });

    console.log("Getting user profile with IG ID:", appScopedUserId);
    const { username, user_id: professionalUserId } =
      await fetchInstagramProfile({
        accessToken,
        igUserId: appScopedUserId,
      });

    if (!professionalUserId) {
      throw new Error("Instagram profile response did not return user_id");
    }

    const normalizedAppScopedUserId = String(appScopedUserId);
    const normalizedProfessionalUserId = String(professionalUserId);

    console.log(
      "Instagram connection successful for:",
      username,
      normalizedProfessionalUserId,
      normalizedAppScopedUserId,
    );

    const { accessToken: longLivedToken, expiresIn: expires_in } =
      await exchangeLongLivedInstagramToken({
        clientSecret: INSTAGRAM_CLIENT_SECRET!,
        accessToken,
      });

    const result = await saveInstagramConnection({
      instagramUserId: normalizedProfessionalUserId,
      appScopedUserId: normalizedAppScopedUserId,
      username,
      accessToken: longLivedToken,
      expiresIn: expires_in,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to save Instagram connection");
    }

    console.log("Instagram connection saved to database");
    return NextResponse.redirect(
      buildRedirectUrl(request, returnTo, { success: "instagram_connected" }),
    );
  } catch (error) {
    console.error("Instagram auth error:", error);
    return NextResponse.redirect(
      buildRedirectUrl(request, returnTo, { error: "auth_failed" }),
    );
  }
}

function getRawQueryParam(url: string, key: string): string | null {
  const queryStart = url.indexOf("?");
  if (queryStart === -1) {
    return null;
  }

  const query = url.slice(queryStart + 1).split("#", 1)[0];
  for (const pair of query.split("&")) {
    if (!pair) {
      continue;
    }

    const [rawKey, ...rawValueParts] = pair.split("=");
    if (decodeURIComponent(rawKey) !== key) {
      continue;
    }

    return decodeURIComponent(rawValueParts.join("="));
  }

  return null;
}
