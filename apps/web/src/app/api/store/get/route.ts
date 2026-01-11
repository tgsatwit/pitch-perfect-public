import { NextRequest, NextResponse } from "next/server";
import { Client } from "@langchain/langgraph-sdk";
import { LANGGRAPH_API_URL } from "@/constants";
import { verifyUserAuthenticated } from "@/lib/firebase/verify_user_server";

export async function POST(req: NextRequest) {
  let authUser;

  // Bypass authentication in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Bypassing authentication for store/get API');
    authUser = { user: true, uid: 'dev-user-id' };
  } else {
    // Production authentication check
    try {
      authUser = await verifyUserAuthenticated();
      if (!authUser?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } catch (e) {
      console.error("Failed to fetch user", e);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { namespace, key } = await req.json();

  const lgClient = new Client({
    apiKey: process.env.LANGCHAIN_API_KEY,
    apiUrl: LANGGRAPH_API_URL,
  });

  try {
    const item = await lgClient.store.getItem(namespace, key);

    return new NextResponse(JSON.stringify({ item }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (_) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to share run after multiple attempts." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
