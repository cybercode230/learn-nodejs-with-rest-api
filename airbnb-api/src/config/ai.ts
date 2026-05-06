import { ChatGroq } from "@langchain/groq";

/**
 * Creative model instance (temperature 0.7)
 * Good for conversational tasks like chat and description generation.
 * Using Llama 3.3 70B for better reasoning and creative output.
 */
export const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  apiKey: process.env["GROQ_API_KEY"],
});

/**
 * Deterministic model instance (temperature 0)
 * Critical for extracting consistent, valid JSON filters from natural language.
 * Using Llama 3.1 8B for fast, deterministic extraction.
 */
export const deterministicModel = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0,
  apiKey: process.env["GROQ_API_KEY"],
});

export default model;