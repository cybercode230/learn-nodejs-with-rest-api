/**
 * File: ai.service.ts
 * What it is doing: Handles core business logic for AI-powered features using LangChain and Groq.
 * Responsibility: Processing natural language search, generating listing descriptions, managing AI chat with memory, creating booking recommendations, and summarizing listing reviews.
 * Outcomes: Returns structured data, generated text, or AI responses to be consumed by the AI controller.
 */

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { model, deterministicModel } from "../config/ai.js";
import prisma from "../config/prisma.js";

// ─── PART 1: SMART LISTING SEARCH ─────────────────────────────────────────────

const searchPrompt = ChatPromptTemplate.fromTemplate(`
You are a search assistant for an Airbnb-like platform.
Extract search filters from the user's natural language query.

User query: {query}

Guidelines:
- location: Extract the city or area. **Correct minor typos** (e.g., "kacyirru" -> "Kacyiru") to ensure database matching.
- type: exactly one of APARTMENT, HOUSE, VILLA, CABIN
- guests: number (minimum capacity)
- maxPrice: number (maximum price per night)

Return a JSON object. Use null if a field is not mentioned.
Return ONLY valid JSON. No explanation.
Example: {{"location": "Kigali", "type": "APARTMENT", "guests": 2, "maxPrice": 100}}
`);


const searchParser = new JsonOutputParser();
const searchChain = searchPrompt.pipe(deterministicModel).pipe(searchParser);

// ─── PART 2: LISTING DESCRIPTION GENERATOR ────────────────────────────────────

/** 
 * Here is the tone changing 
 * "professional" professional — formal, clear, business-like
 * "casual" friendly, relaxed, conversational
 * "luxury" elegant, premium, aspirational
 **/
const descriptionPrompt = ChatPromptTemplate.fromTemplate(`
You are a professional copywriter for an Airbnb-like platform.
Write an engaging listing description with a {tone} tone.

Tone Guidelines:
- professional: formal, clear, business-like
- casual: friendly, relaxed, conversational
- luxury: elegant, premium, aspirational

Listing details:
- Title: {title}
- Location: {location}
- Type: {type}
- Max guests: {guests}
- Amenities: {amenities}
- Price per night: $\{price\} USD

Write a 3-paragraph description. Return ONLY the description text.
`);

const descriptionChain = descriptionPrompt.pipe(model).pipe(new StringOutputParser());

// ─── PART 3: GUEST SUPPORT CHATBOT ────────────────────────────────────────────

const sessionHistories = new Map<string, InMemoryChatMessageHistory>();

function getSessionHistory(sessionId: string): InMemoryChatMessageHistory {
  if (!sessionHistories.has(sessionId)) {
    sessionHistories.set(sessionId, new InMemoryChatMessageHistory());
  }
  return sessionHistories.get(sessionId)!;
}

const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", "{system_prompt}"],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
]);

const chatChain = chatPrompt.pipe(model);

const chainWithHistory = new RunnableWithMessageHistory({
  runnable: chatChain,
  getMessageHistory: getSessionHistory,
  inputMessagesKey: "input",
  historyMessagesKey: "chat_history",
});

// ─── PART 4: AI BOOKING RECOMMENDATION ────────────────────────────────────────

const recommendationPrompt = ChatPromptTemplate.fromTemplate(`
System: You are a travel recommendation expert. You must respond ONLY with a valid JSON object. Do not include any introductory text, explanation, or markdown code blocks.

User's Booking History:
{history}

Required JSON structure:
{{
  "preferences": "string describing what the user likes",
  "searchFilters": {{
    "location": "string or null",
    "type": "exactly one of [APARTMENT, HOUSE, VILLA, CABIN] or null",
    "maxPrice": number or null,
    "guests": number or null
  }},
  "reason": "string explaining the recommendation"
}}

Strictly return ONLY the JSON object.
`);


const recommendationChain = recommendationPrompt.pipe(deterministicModel).pipe(new JsonOutputParser());

// ─── PART 5: LISTING REVIEW SUMMARIZER ────────────────────────────────────────

const summaryPrompt = ChatPromptTemplate.fromTemplate(`
You are a review analyst. Summarize guest reviews for this listing.

Reviews:
{reviews}

Return ONLY a JSON object in this format:
{{
  "summary": "2-3 sentence overall summary of guest experience",
  "positives": ["array of 3 positive things"],
  "negatives": ["array of things guests complained about, or empty if none"]
}}
`);

const summaryChain = summaryPrompt.pipe(model).pipe(new JsonOutputParser());

export class AIService {
  static async naturalLanguageSearch(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const filters = await searchChain.invoke({ query }) as any;

    const allNull = Object.values(filters).every(v => v === null);
    if (allNull) return { filters, data: [], meta: { total: 0, page, limit, totalPages: 0 }, error: "NO_FILTERS" };

    const where: any = {};
    if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
    if (filters.type) where.type = filters.type;
    if (filters.guests) where.guests = { gte: filters.guests };
    if (filters.maxPrice) where.pricePerNight = { lte: filters.maxPrice };
    // Use Promise.all to fetch listings and count simultaneously
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { host: { select: { name: true, email: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.listing.count({ where }),
    ]);

    return { filters, data: listings, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async generateDescription(id: string, userId: string, tone: string) {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return { error: "NOT_FOUND" };
    if (listing.hostId !== userId) return { error: "FORBIDDEN" };

    const description = await descriptionChain.invoke({
      tone,
      title: listing.title,
      location: listing.location,
      type: listing.type,
      guests: listing.guests,
      amenities: listing.amenities.join(", "),
      price: listing.pricePerNight,
    });

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: { description },
    });

    return { description, listing: updatedListing };
  }

  static async chat(message: string, sessionId: string, listingId?: string) {
    let system_prompt = "You are a helpful guest support assistant for an Airbnb-like platform.";

    if (listingId) {
      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (listing) {
        system_prompt = `
You are a helpful guest support assistant for an Airbnb-like platform.
You are currently helping a guest with questions about this specific listing:

Title: ${listing.title}
Location: ${listing.location}
Price per night: $${listing.pricePerNight}
Max guests: ${listing.guests}
Type: ${listing.type}
Amenities: ${listing.amenities.join(", ")}
Description: ${listing.description}

Answer questions about this listing accurately based on the details above.
If asked something not covered by the listing details, say you don't have that information.
        `;
      }
    }

    const history = getSessionHistory(sessionId);
    const messages = await history.getMessages();

    if (messages.length > 20) {
      const trimmedMessages = messages.slice(-20);
      await history.clear();
      for (const msg of trimmedMessages) await history.addMessage(msg);
    }

    const response = await chainWithHistory.invoke(
      { input: message, system_prompt },
      { configurable: { sessionId } }
    );

    const updatedMessages = await history.getMessages();
    return { response: response.content, sessionId, messageCount: updatedMessages.length };
  }

  static async recommend(userId: string) {
    const lastBookings = await prisma.booking.findMany({
      where: { guestId: userId },
      take: 5,
      include: { listing: true },
      orderBy: { createdAt: "desc" },
    });

    if (lastBookings.length === 0) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      return { error: "NO_HISTORY", userName: user?.name || "Guest" };
    }

    const historySummary = lastBookings
      .map((b: any) => `- ${b.listing.title} (${b.listing.type}) in ${b.listing.location}, $${b.listing.pricePerNight}/night, ${b.listing.guests} guests`)
      .join("\n");

    const recommendation = await recommendationChain.invoke({ history: historySummary }) as any;
    const filters = recommendation.searchFilters || {};
    const bookedListingIds = lastBookings.map((b: any) => b.listingId);

    const where: any = { id: { notIn: bookedListingIds } };
    if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
    const validTypes = ["APARTMENT", "HOUSE", "VILLA", "CABIN"];
    if (filters.type && validTypes.includes(filters.type)) {
      where.type = filters.type;
    }
    if (filters.guests) where.guests = { gte: Number(filters.guests) };
    if (filters.maxPrice) where.pricePerNight = { lte: Number(filters.maxPrice) };

    const recommendations = await prisma.listing.findMany({
      where,
      take: 5,
      include: { host: { select: { name: true } } },
    });

    return { preferences: recommendation.preferences, reason: recommendation.reason, searchFilters: filters, recommendations };
  }

  static async getReviewSummary(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { reviews: { include: { guest: { select: { name: true } } } } },
    });

    if (!listing) return { error: "NOT_FOUND" };

    const reviews = (listing as any).reviews;
    if (reviews.length < 3) return { error: "NOT_ENOUGH_REVIEWS" };

    const reviewsText = reviews
      .map((r: any) => `Guest ${r.guest.name} rated ${r.rating}/5: ${r.comment}`)
      .join("\n");

    const aiSummary = await summaryChain.invoke({ reviews: reviewsText }) as any;
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews;

    return { ...aiSummary, averageRating: parseFloat(averageRating.toFixed(1)), totalReviews };
  }
}
