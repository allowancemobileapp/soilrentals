"use server";

import { suggestRentalAmount as suggestRentalAmountFlow, type SuggestRentalAmountInput, type SuggestRentalAmountOutput } from "@/ai/flows/suggest-rental-amount";

export async function suggestRentalAmount(input: SuggestRentalAmountInput): Promise<SuggestRentalAmountOutput> {
  try {
    const result = await suggestRentalAmountFlow(input);
    return result;
  } catch (error) {
    console.error("Error suggesting rental amount:", error);
    throw new Error("Failed to get rental suggestion. Please try again.");
  }
}
