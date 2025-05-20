import { NextRequest, NextResponse } from "next/server";
import { addClient, removeClient } from "../route";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };

  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Add client to the clients map
  addClient(userId, writer);

  // Send initial message
  await writer.write(
    encoder.encode(`data: ${JSON.stringify({ message: "SSE connection established" })}\n\n`)
  );

  // Handle client disconnection
  req.signal.addEventListener("abort", () => {
    removeClient(userId, writer);
    writer.close().catch((err) => console.error("Error closing writer:", err));
  });

  return new NextResponse(stream.readable, { headers });
}