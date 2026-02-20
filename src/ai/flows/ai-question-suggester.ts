'use server';
/**
 * @fileOverview An AI assistant that suggests rephrased poll questions for clarity, engagement, and neutrality.
 *
 * - aiQuestionSuggester - A function that handles the question suggestion process.
 * - AiQuestionSuggesterInput - The input type for the aiQuestionSuggester function.
 * - AiQuestionSuggesterOutput - The return type for the aiQuestionSuggester function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiQuestionSuggesterInputSchema = z.object({
  question: z.string().describe('The original poll question draft.'),
  context: z
    .string()
    .optional()
    .describe(
      'Optional context or topic related to the poll question, to help with better suggestions.'
    ),
});
export type AiQuestionSuggesterInput = z.infer<
  typeof AiQuestionSuggesterInputSchema
>;

const AiQuestionSuggesterOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'An array of suggested rephrased questions to improve clarity, engagement, and neutrality.'
    ),
});
export type AiQuestionSuggesterOutput = z.infer<
  typeof AiQuestionSuggesterOutputSchema
>;

export async function aiQuestionSuggester(
  input: AiQuestionSuggesterInput
): Promise<AiQuestionSuggesterOutput> {
  return aiQuestionSuggesterFlow(input);
}

const suggestQuestionPrompt = ai.definePrompt({
  name: 'suggestQuestionPrompt',
  input: {schema: AiQuestionSuggesterInputSchema},
  output: {schema: AiQuestionSuggesterOutputSchema},
  prompt: `You are an AI assistant specialized in crafting clear, engaging, and neutral poll questions.

Your task is to rephrase the given poll question to improve its clarity, engagement, and neutrality. Provide a list of at least 3, but no more than 5, distinct suggestions.

Consider the following aspects:
- **Clarity**: Is the question easy to understand? Is it unambiguous?
- **Engagement**: Does the question encourage participation? Is it thought-provoking?
- **Neutrality**: Is the question free from bias or leading language? Does it allow for a wide range of responses?

Original Question: "{{{question}}}"
{{#if context}}
Context/Topic: "{{{context}}}"
{{/if}}

Please provide your suggestions as a JSON array of strings.`,
});

const aiQuestionSuggesterFlow = ai.defineFlow(
  {
    name: 'aiQuestionSuggesterFlow',
    inputSchema: AiQuestionSuggesterInputSchema,
    outputSchema: AiQuestionSuggesterOutputSchema,
  },
  async input => {
    const {output} = await suggestQuestionPrompt(input);
    return output!;
  }
);
