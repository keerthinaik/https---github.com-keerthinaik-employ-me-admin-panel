// This file uses server-side code.
'use server';

/**
 * @fileOverview AI-powered content moderation flow.
 *
 * This file defines a Genkit flow that uses AI to identify and flag
 * inappropriate content in job descriptions and user profiles. It exports:
 * - moderateContent: The main function to moderate content.
 * - ModerateContentInput: The input type for the moderateContent function.
 * - ModerateContentOutput: The output type for the moderateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateContentInputSchema = z.object({
  text: z.string().describe('The text content to be moderated.'),
});
export type ModerateContentInput = z.infer<typeof ModerateContentInputSchema>;

const ModerateContentOutputSchema = z.object({
  isAppropriate: z.boolean().describe('Whether the content is appropriate.'),
  reason: z.string().describe('The reason why the content is considered inappropriate, if applicable.'),
});
export type ModerateContentOutput = z.infer<typeof ModerateContentOutputSchema>;

export async function moderateContent(input: ModerateContentInput): Promise<ModerateContentOutput> {
  return moderateContentFlow(input);
}

const moderateContentPrompt = ai.definePrompt({
  name: 'moderateContentPrompt',
  input: {schema: ModerateContentInputSchema},
  output: {schema: ModerateContentOutputSchema},
  prompt: `You are a content moderation expert. Your task is to determine whether the given text content is appropriate for a public job board and user profiles. Content should be professional and safe for all users.

  Analyze the following content:
  \"{{{text}}}\"

  Determine if it is appropriate. If it is not, explain why.
  Respond in JSON format with 'isAppropriate' set to true or false, and 'reason' providing a reason if it is not appropriate.`,
});

const moderateContentFlow = ai.defineFlow(
  {
    name: 'moderateContentFlow',
    inputSchema: ModerateContentInputSchema,
    outputSchema: ModerateContentOutputSchema,
  },
  async input => {
    const {output} = await moderateContentPrompt(input);
    return output!;
  }
);
