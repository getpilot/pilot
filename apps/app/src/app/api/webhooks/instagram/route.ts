import { NextResponse } from "next/server";
import { db } from "@pilot/db";
import { verifyWebhookSignature } from "@pilot/instagram";
import { processInstagramWebhook } from "@pilot/core/workflows/instagram-webhook";
import { inngest } from "@/lib/inngest/client";
import { env } from "@/env";
import { getBillingStatus } from "@/lib/billing/enforce";

type InstagramWebhookPayload = {
  object: string;
  entry: Array<{
    id: string;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp?: number;
      message?: { text?: string; mid?: string; is_echo?: boolean };
    }>;
    changes?: Array<unknown>;
  }>;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");
    const expected = process.env.IG_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && challenge) {
      if (expected && token && expected === token) {
        return new NextResponse(challenge, { status: 200 });
      }
      return new NextResponse("forbidden", { status: 403 });
    }

    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    console.error("GET error", error);
    return new NextResponse("error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-hub-signature-256");
    const appSecret = env.IG_APP_SECRET ?? "";

    if (!verifyWebhookSignature(rawBody, signatureHeader, appSecret)) {
      return new NextResponse("invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody) as InstagramWebhookPayload;
    const result = await processInstagramWebhook({
      dbClient: db,
      inngestClient: inngest,
      payload,
      resolveBillingStatus: getBillingStatus,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("instagram webhook error", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
