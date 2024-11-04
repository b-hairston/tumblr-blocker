// app/api/auth/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';

export async function GET(req: NextRequest) {
  const cookies = parse(req.headers.get('cookie') || "");

  const sourceAuthenticated = !!cookies.oauth_token_source;
  const targetAuthenticated = !!cookies.oauth_token_target;

  return NextResponse.json({ sourceAuthenticated, targetAuthenticated });
}
