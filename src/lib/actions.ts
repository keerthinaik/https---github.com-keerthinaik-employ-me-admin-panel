"use server";

import {
  moderateContent,
  type ModerateContentOutput,
} from "@/ai/flows/moderate-content";

type ModerationState = {
  output: ModerateContentOutput | null;
  error: string | null;
};

export async function handleModeration(
  prevState: ModerationState,
  formData: FormData
): Promise<ModerationState> {
  const text = formData.get("content") as string;

  if (!text || text.trim().length === 0) {
    return { output: null, error: "Content cannot be empty." };
  }

  try {
    const output = await moderateContent({ text });
    return { output, error: null };
  } catch (e) {
    console.error(e);
    // This provides a user-friendly error message.
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during moderation.";
    return { output: null, error: errorMessage };
  }
}
