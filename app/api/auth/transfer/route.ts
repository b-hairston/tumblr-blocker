// pages/api/transfer.ts
import axios, { AxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

interface BlockedBlog {
  name: string;
}

interface BlockResponse {
  response: {
    blocked_tumblelogs: BlockedBlog[];
  };
}

interface TransferRequestBody {
  sourceBlog: string;
  targetBlog: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { sourceBlog, targetBlog }: TransferRequestBody = req.body;

  // Retrieve the access token from cookies
  const cookies = cookie.parse(req.headers.cookie || "");
  const accessToken = cookies.oauth_token_source; // Use the specific token for source

  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Fetch blocked blogs from the source account
    const blockedResponse = await axios.get<BlockResponse>(
      `https://api.tumblr.com/v2/blog/${sourceBlog}/blocks`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!blockedResponse.data.response) {
      return res.status(404).json({ error: "Blocked blogs not found." });
    }

    const blockedBlogs = blockedResponse.data.response.blocked_tumblelogs;

    // Prepare the list of blocked tumblelogs
    const blockedTumblelogs = blockedBlogs.map(blog => blog.name).join(',');

    // Block the list of blogs on the target account using the bulk block endpoint
    const bulkBlockResponse = await axios.post(
      `https://api.tumblr.com/v2/blog/${targetBlog}/blocks/bulk`,
      {
        blocked_tumblelogs: blockedTumblelogs,
        force: false, // Set to true if you want to force the block even if it cancels subscriptions
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Use the appropriate access token for the target account if needed
        },
      }
    );

    if (bulkBlockResponse.status === 200) {
      res.status(200).json({ message: "Transfer completed successfully!" });
    } else {
      console.error("Bulk block response:", bulkBlockResponse.data);
      res.status(bulkBlockResponse.status).json({ error: "Failed to block some blogs." });
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Failed to transfer blocks:", axiosError.response?.data || axiosError.message);
    res.status(500).json({ error: "Failed to transfer blocks" });
  }
}
