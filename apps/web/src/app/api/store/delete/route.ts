import { NextRequest, NextResponse } from "next/server";
import { Client } from "@langchain/langgraph-sdk";
import { LANGGRAPH_API_URL } from "@/constants";
import { verifyUserAuthenticated } from "@/lib/firebase/verify_user_server";

export async function POST(req: NextRequest) {
  let authUser;

  // Bypass authentication in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Bypassing authentication for store/delete API');
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
    await lgClient.store.deleteItem(namespace, key);

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (_) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to remove store item after multiple attempts." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
