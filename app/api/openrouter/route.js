import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const body = await request.json();

    // Using axios instead of the OpenAI SDK for more control over the request
    const response = await axios({
      method: "post",
      url: "https://openrouter.ai/api/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        // Adding OpenRouter recommended headers
        "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
        "X-Title": "Discussion Room Application",
      },
      data: {
        model: body.model || process.env.OPENROUTER_MODEL,
        messages: body.messages,
        // Adding a timeout to prevent long-hanging requests
        timeout: 60000, // 60 seconds timeout
      },
      // Setting a longer timeout
      timeout: 60000,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("OpenRouter API error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return NextResponse.json(
      {
        error: error.message,
        details:
          error.response?.data || "No additional error details available",
      },
      { status: error.response?.status || 500 }
    );
  }
}
