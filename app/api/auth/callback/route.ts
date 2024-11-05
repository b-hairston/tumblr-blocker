import { NextRequest, NextResponse } from 'next/server';
import { serialize, parse } from 'cookie';
import axios, { AxiosError } from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  console.log("State in query parameter:", state);

  console.log("Callback URL parameters:", { code, state });
  const cookies = parse(req.headers.get("cookie") || "");
  console.log("Cookies received in callback:", cookies);

  if (!code || !state) {
    console.error("Missing code or state parameter");
    return NextResponse.json({ error: "Authorization code or state is missing" }, { status: 400 });
  }

  const accountType = cookies.account_type;
  const clientId = process.env.NEXT_PUBLIC_TUMBLR_CLIENT_ID;
  const clientSecret = process.env.TUMBLR_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  try {
    console.log("Attempting token exchange with the following parameters:", {
      clientId,
      clientSecret: clientSecret ? "[HIDDEN]" : "MISSING",
      code,
      redirectUri,
    });

    // Correct token request
    const tokenResponse = await axios.post(
      'https://api.tumblr.com/v2/oauth2/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId!,
        client_secret: clientSecret!,
        code: code!,
        redirect_uri: redirectUri!,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const tokenCookieName = accountType === "source" ? "oauth_token_source" : "oauth_token_target";
    const response = NextResponse.redirect(`${req.nextUrl.origin}/`);

    response.headers.append(
      "Set-Cookie",
      serialize("oauth_state", state, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none"
      })
    );

    response.headers.append("Set-Cookie", serialize("oauth_state", "", { path: "/", maxAge: -1 }));
    response.headers.append("Set-Cookie", serialize("account_type", "", { path: "/", maxAge: -1 }));

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ meta: { status: number; msg: string }; errors: unknown[] }>;
      if (axiosError.response) {
        console.error("Error response from Tumblr:", axiosError.response.data);
        return NextResponse.json({
          error: axiosError.response.data.meta.msg || "Failed to authenticate",
          details: axiosError.response.data.errors,
        }, { status: axiosError.response.status });
      }
    } else if (error instanceof Error) {
      console.error("Unexpected error during token exchange:", error.message);
      return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 });
    } else {
      console.error("Unknown error type:", error);
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
    }
  }
}
