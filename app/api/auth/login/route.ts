// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const tumblrAuthUrl = "https://www.tumblr.com/oauth2/authorize";
  const clientId = process.env.NEXT_PUBLIC_TUMBLR_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://www.tumblr-blocker.xyz/api/auth/callback';
  const accountType = req.nextUrl.searchParams.get("accountType"); // "source" or "target"

  if (!clientId || !redirectUri || !accountType) {
    return NextResponse.json({ error: "Missing clientId, redirectUri, or accountType" }, { status: 500 });
  }

  const state = crypto.randomUUID();

  const authUrl = `${tumblrAuthUrl}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${state}&scope=basic write offline_access`;

  console.log("Generated Tumblr Auth URL:", authUrl);

  const response = NextResponse.redirect(authUrl);

  // Clear cookies for current login attempt, keeping source account auth untouched
  console.log("Generated state:", state);
  response.headers.append(
    "Set-Cookie",
    serialize("oauth_state", state, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
);
  response.headers.append(
    'Set-Cookie',
    serialize('account_type', accountType, { path: '/', httpOnly: true })
  );

  return response;
}
