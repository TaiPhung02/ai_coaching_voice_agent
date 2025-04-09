import axios from "axios";
import { CoachingOptions } from "./Options";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

export const getToken = async () => {
  const result = await axios.get("/api/getToken");
  return result.data;
};

export const AIModel = async (topic, coachingOption, lastTwoConversation) => {
  const selectedOption = coachingOption || CoachingOptions[0]?.name;
  const option = CoachingOptions.find((item) => item.name === selectedOption);

  if (!option) throw new Error(`Coaching option "${selectedOption}" not found`);

  const PROMPT = option.prompt.replace("{user_topic}", topic);

  try {
    const response = await fetch("/api/openrouter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek/deepseek-v3-base:free",
        messages: [
          { role: "assistant", content: PROMPT },
          ...lastTwoConversation,
        ],
      }),
    });

    const completion = await response.json();
    console.log("API Response:", completion); // Debugging

    if (completion.error) {
      const errorMessage = completion.error.message || "Unknown API error";
      console.error("AI API Error Details:", completion.error);
      throw new Error(`AI Error: ${errorMessage}`);
    }

    return completion.choices[0].message;
  } catch (error) {
    console.error("Request Failed:", error);
    throw new Error(`Request failed: ${error.message}`);
  }
};

export const ConvertTextToSpeech = async (text, expertName) => {
  console.log("text", text)
  console.log("expertName", expertName)
  const pollyClient = new PollyClient({
    region: "ap-southeast-1",
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY_ID,
    },
  });

  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: expertName || "Joanna",
  });

  try {
    const { AudioStream } = await pollyClient.send(command);

    const audioArrayBuffer = await AudioStream.transformToByteArray();
    const audioBlob = new Blob([audioArrayBuffer], { type: "audio/mp3" });

    const audioUrl = URL.createObjectURL(audioBlob);

    return audioUrl;
  } catch (error) {
    console.log(error);
  }
};
