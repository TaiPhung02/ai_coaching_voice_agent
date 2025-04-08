import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";

const assemblyAi = new AssemblyAI({ apiKey: process.env.ASSEMBLY_API_KEY });

export async function GET(req) {
  try {
    const token = await assemblyAi.realtime.createTemporaryToken({
      expires_in: 3600,
    });

    return NextResponse.json(token);
  } catch (error) {
    console.error("Error generating AssemblyAI token:", error);
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
}
