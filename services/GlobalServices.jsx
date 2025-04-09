import axios from "axios";
import { CoachingOptions } from "./Options";

export const getToken = async () => {
  const result = await axios.get("/api/getToken");
  return result.data;
};

export const AIModel = async (topic, coachingOption, msg) => {
  const option = CoachingOptions.find((item) => item.name === coachingOption);
  const PROMPT = option.prompt.replace("{user_topic}", topic);

  try {
    const response = await fetch("/api/openrouter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v3-base:free",
        messages: [
          { role: "assistant", content: PROMPT },
          { role: "user", content: msg },
        ],
      }),
    });

    const completion = await response.json();

    if (completion.error) {
      throw new Error(completion.error);
    }

    console.log(completion.choices[0].message);
    return completion.choices[0].message;
  } catch (error) {
    console.error("Error calling AI model:", error);
    throw error;
  }
};
