import { NextResponse } from "next/server";
import { saveInstagramConnection } from "@/actions/instagram";
import {
  exchangeCodeForAccessToken,
  exchangeLongLivedInstagramToken,
  fetchInstagramProfile,
} from "@pilot/instagram";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;

export async function GET(request: Request) {
  const redirectUri = new URL("/api/auth/instagram/callback", request.url).toString();
  const { searchParams } = new URL(request.url);
  const code = getRawQueryParam(request.url, "code");
  const error = searchParams.get("error");

  if (error) {
    console.error("Instagram auth error from redirect:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=${error}`);
  }

  if (!code) {
    console.error("No code provided in Instagram callback");
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_code`);
  }

  try {
    console.log("Exchanging code for access token with redirect URI:", redirectUri);
    const {
      accessToken,
      appScopedUserId,
    } = await exchangeCodeForAccessToken({
      clientId: INSTAGRAM_CLIENT_ID!,
      clientSecret: INSTAGRAM_CLIENT_SECRET!,
      redirectUri,
      code,
    });

    console.log("Getting user profile with IG ID:", appScopedUserId);
    const {
      username,
      user_id: professionalUserId,
    } = await fetchInstagramProfile({
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

    const {
      accessToken: longLivedToken,
      expiresIn: expires_in,
    } = await exchangeLongLivedInstagramToken({
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
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?success=instagram_connected`);
  } catch (error) {
    console.error("Instagram auth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=auth_failed`
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
