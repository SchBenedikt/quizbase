'use server';
/**
 * @fileOverview This file implements a Genkit flow for summarizing open-text poll responses.
 *
 * - aiOpenTextSummarizer - A function that summarizes key themes and insights from open-text poll responses.
 * - OpenTextSummarizerInput - The input type for the aiOpenTextSummarizer function.
 * - OpenTextSummarizerOutput - The return type for the aiOpenTextSummarizer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OpenTextSummarizerInputSchema = z.object({
  responses: z
    .array(z.string())
    .describe('An array of open-text responses from a poll.'),
});
export type OpenTextSummarizerInput = z.infer<typeof OpenTextSummarizerInputSchema>;

const OpenTextSummarizerOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the key themes and insights from the open-text poll responses.'
    ),
});
export type OpenTextSummarizerOutput = z.infer<typeof OpenTextSummarizerOutputSchema>;

export async function aiOpenTextSummarizer(
  input: OpenTextSummarizerInput
): Promise<OpenTextSummarizerOutput> {
  return aiOpenTextSummarizerFlow(input);
}

const aiOpenTextSummarizerPrompt = ai.definePrompt({
  name: 'aiOpenTextSummarizerPrompt',
  input: {schema: OpenTextSummarizerInputSchema},
  output: {schema: OpenTextSummarizerOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing qualitative feedback.
Your task is to analyze the following open-text poll responses and extract the key themes, insights, and common sentiments.
Provide a concise summary that captures the essence of the collective feedback, highlighting recurring ideas and important points.
Aim for clarity and neutrality.

Open-text responses:
{{#each responses}}
- {{{this}}}
{{/each}}`,
});

const aiOpenTextSummarizerFlow = ai.defineFlow(
  {
    name: 'aiOpenTextSummarizerFlow',
    inputSchema: OpenTextSummarizerInputSchema,
    outputSchema: OpenTextSummarizerOutputSchema,
  },
  async (input) => {
    const {output} = await aiOpenTextSummarizerPrompt(input);
    return output!;
  }
);
