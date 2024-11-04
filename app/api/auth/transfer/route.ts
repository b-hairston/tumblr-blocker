import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { parse } from "cookie";

interface BlockedBlog {
  name: string;
}

interface BlockResponse {
  response: {
    blocked_tumblelogs: BlockedBlog[];
  };
}

// GET handler for retrieving blocked blogs from the source account
export async function GET(req: NextRequest) {
  const cookies = parse(req.headers.get("cookie") || "");
  const sourceAccessToken = cookies.oauth_token_source;
  const sourceBlog = req.nextUrl.searchParams.get("sourceBlog");

  if (!sourceAccessToken) {
    return NextResponse.json({ error: "Source account is not authenticated." }, { status: 401 });
  }

  if (!sourceBlog) {
    return NextResponse.json({ error: "Source blog ID is required." }, { status: 400 });
  }

  try {
    const blockedResponse = await axios.get<BlockResponse>(
      `https://api.tumblr.com/v2/blog/${sourceBlog}/blocks`,
      {
        headers: {
          Authorization: `Bearer ${sourceAccessToken}`,
        },
      }
    );

    if (!blockedResponse.data.response) {
      return NextResponse.json({ error: "Blocked blogs not found." }, { status: 404 });
    }

    const blockedBlogs = blockedResponse.data.response.blocked_tumblelogs;
    return NextResponse.json({ blockedBlogs }, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve blocked blogs:", error);
    return NextResponse.json({ error: "Failed to retrieve blocked blogs" }, { status: 500 });
  }
}

// POST handler for bulk blocking blogs on the target account
export async function POST(req: NextRequest) {
  const cookies = parse(req.headers.get("cookie") || "");
  const targetAccessToken = cookies.oauth_token_target;

  const { targetBlog, blockedBlogs } = await req.json();

  if (!targetAccessToken) {
    return NextResponse.json({ error: "Target account is not authenticated." }, { status: 401 });
  }

  if (!targetBlog || !blockedBlogs || blockedBlogs.length === 0) {
    return NextResponse.json({ error: "Target blog ID and blocked blogs are required." }, { status: 400 });
  }

  try {
    const bulkBlockResponse = await axios.post(
      `https://api.tumblr.com/v2/blog/${targetBlog}/blocks/bulk`,
      {
        blocked_tumblelogs: blockedBlogs.join(","),
        force: false,
      },
      {
        headers: {
          Authorization: `Bearer ${targetAccessToken}`,
        },
      }
    );

    if (bulkBlockResponse.status === 200) {
      return NextResponse.json({ message: "Bulk block on target completed successfully!" });
    } else {
      console.error("Bulk block response:", bulkBlockResponse.data);
      return NextResponse.json({ error: "Failed to block some blogs." }, { status: bulkBlockResponse.status });
    }
  } catch (error) {
    console.error("Failed to bulk block on target:", error);
    return NextResponse.json({ error: "Failed to bulk block on target." }, { status: 500 });
  }
}
