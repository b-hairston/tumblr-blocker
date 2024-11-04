// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parse, serialize } from 'cookie';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const returnedState = searchParams.get('state');
  const code = searchParams.get('code');
  const cookies = parse(req.headers.get('cookie') || "");

  const originalState = cookies.oauth_state;
  const accountType = cookies.account_type; // "source" or "target"

  if (!returnedState || returnedState !== originalState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  if (!code || !accountType) {
    return NextResponse.json({ error: "Authorization code or account type is missing" }, { status: 400 });
  }

  const tokens = await exchangeCodeForTokens(code);

  const redirectUrl = `${req.nextUrl.origin}/`; // Redirect to home page

  const response = NextResponse.redirect(redirectUrl);

  // Store token based on account type
  response.headers.append(
    'Set-Cookie',
    serialize(`oauth_token_${accountType}`, tokens.access_token, { path: '/', httpOnly: true, sameSite: 'lax' })
  );
  // Clear state and account_type cookies after login
  response.headers.append(
    'Set-Cookie',
    serialize('oauth_state', '', { path: '/', httpOnly: true, maxAge: 0 })
  );
  response.headers.append(
    'Set-Cookie',
    serialize('account_type', '', { path: '/', httpOnly: true, maxAge: 0 })
  );

  return response;
}

// Helper function to exchange authorization code for access token
async function exchangeCodeForTokens(code: string) {
  const clientId = process.env.NEXT_PUBLIC_TUMBLR_CLIENT_ID;
  const clientSecret = process.env.TUMBLR_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  const response = await fetch("https://api.tumblr.com/v2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri!,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to exchange code for tokens: ${errorData.error_description || "Unknown error"}`);
  }

  return response.json();
}
