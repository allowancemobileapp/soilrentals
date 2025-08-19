'use server';

/**
 * @fileOverview A rental amount suggestion AI agent.
 *
 * - suggestRentalAmount - A function that suggests a rental amount based on property details.
 * - SuggestRentalAmountInput - The input type for the suggestRentalAmount function.
 * - SuggestRentalAmountOutput - The return type for the suggestRentalAmount function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRentalAmountInputSchema = z.object({
  state: z.string().describe('The state where the property is located.'),
  propertyType: z.string().describe('The type of property (e.g., apartment, house).'),
  bedrooms: z.number().describe('The number of bedrooms in the property.'),
  bathrooms: z.number().describe('The number of bathrooms in the property.'),
  squareFootage: z.number().describe('The square footage of the property.'),
  description: z.string().describe('A detailed description of the property including any amenities.'),
});
export type SuggestRentalAmountInput = z.infer<typeof SuggestRentalAmountInputSchema>;

const SuggestRentalAmountOutputSchema = z.object({
  suggestedRentalAmount: z.number().describe('The suggested monthly rental amount in USD.'),
  reasoning: z.string().describe('The reasoning behind the suggested rental amount.'),
});
export type SuggestRentalAmountOutput = z.infer<typeof SuggestRentalAmountOutputSchema>;

export async function suggestRentalAmount(input: SuggestRentalAmountInput): Promise<SuggestRentalAmountOutput> {
  return suggestRentalAmountFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRentalAmountPrompt',
  input: {schema: SuggestRentalAmountInputSchema},
  output: {schema: SuggestRentalAmountOutputSchema},
  prompt: `You are an expert real estate analyst specializing in rental property valuation.

  Based on the following property details, suggest a competitive monthly rental amount in USD and provide a brief reasoning for your suggestion.

  State: {{{state}}}
  Property Type: {{{propertyType}}}
  Bedrooms: {{{bedrooms}}}
  Bathrooms: {{{bathrooms}}}
  Square Footage: {{{squareFootage}}}
  Description: {{{description}}}

  Consider recent rental trends, comparable properties, and the overall condition and amenities of the property.
  The suggestedRentalAmount should be a number (do not include currency symbols or commas), and the reasoning should be clear and concise.
  `,
});

const suggestRentalAmountFlow = ai.defineFlow(
  {
    name: 'suggestRentalAmountFlow',
    inputSchema: SuggestRentalAmountInputSchema,
    outputSchema: SuggestRentalAmountOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
