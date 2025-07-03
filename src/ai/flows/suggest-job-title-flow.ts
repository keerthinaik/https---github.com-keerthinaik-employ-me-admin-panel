
'use server';
/**
 * @fileOverview An AI flow for suggesting job titles based on a job description.
 *
 * - suggestJobTitles - A function that suggests job titles.
 * - SuggestJobTitlesInput - The input type for the suggestJobTitles function.
 * - SuggestJobTitlesOutput - The return type for the suggestJobTitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestJobTitlesInputSchema = z.object({
  description: z.string().describe('The job description.'),
});
export type SuggestJobTitlesInput = z.infer<typeof SuggestJobTitlesInputSchema>;

const SuggestJobTitlesOutputSchema = z.object({
  titles: z.array(z.string()).describe('An array of 3-5 suggested job titles.'),
});
export type SuggestJobTitlesOutput = z.infer<typeof SuggestJobTitlesOutputSchema>;

export async function suggestJobTitles(input: SuggestJobTitlesInput): Promise<SuggestJobTitlesOutput> {
  return suggestJobTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestJobTitlePrompt',
  input: {schema: SuggestJobTitlesInputSchema},
  output: {schema: SuggestJobTitlesOutputSchema},
  prompt: `You are an expert recruitment consultant. Based on the following job description, generate 3 to 5 clear, concise, and industry-standard job titles. Ensure the titles are optimized for searchability on job boards.

Job Description:
{{{description}}}
`,
});

const suggestJobTitleFlow = ai.defineFlow(
  {
    name: 'suggestJobTitleFlow',
    inputSchema: SuggestJobTitlesInputSchema,
    outputSchema: SuggestJobTitlesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
