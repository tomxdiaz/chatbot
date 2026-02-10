'use server';

import { MessageSender, Product, QueryIntent } from '../types';

export async function createEmbedding(text: string): Promise<number[]> {
  const res = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      prompt: text,
    }),
  });

  if (!res.ok) {
    throw new Error('Error creando embedding con Ollama');
  }

  const data = await res.json();
  return data.embedding; // number[]
}

export async function generateChatQuery(
  message: string,
  history: { sender: MessageSender; message: string; products?: Product[] }[],
): Promise<{
  intent: QueryIntent;
  query: string;
  filters: string[];
}> {
  const prompt = `
  You are an intent classification and query extraction system.

Your task:
1. Classify the user intent
2. Extract a concise semantic product query for vector search

You must strictly follow the rules below.

INTENTS:
- PRODUCT_SEARCH: the user is looking for products, food, items, ideas to buy, or expresses a need that can be satisfied with products (e.g. hunger)
- OFF_TOPIC: the message is not related to products

IMPORTANT INTERPRETATION RULES:
- Messages expressing hunger or desire to eat are PRODUCT_SEARCH
- Explicit rejections in the conversation history are hard constraints
- Do NOT include rejected categories or attributes in the query
- Add filters with explicit user preferences (e.g. "I want a red dress" -> filter: "red", "I want a cheap phone" -> filter: "cheap", "I don´t want vegan options" -> filter: "NOT vegan")

QUERY RULES:
- Only for PRODUCT_SEARCH
- Neutral, factual English
- Short and descriptive (no filler, no greetings)
- Optimized for vector similarity search
- Do NOT mention brands unless explicitly requested

OFF_TOPIC RULES:
- If intent is OFF_TOPIC:
  - query must be an empty string
  - filters must be an empty array

OUTPUT FORMAT:
- Respond ONLY with raw JSON
- No explanations, no markdown, no extra text

JSON SCHEMA:
{
  "intent": "PRODUCT_SEARCH | OFF_TOPIC",
  "query": "string",
  "filters": ["string"]
}

USER MESSAGE:
${message}

CONVERSATION HISTORY:
${history.map((h) => `${h.sender}: ${h.message}${h.products ? ` (Products: ${h.products.map((p) => p.title).join(', ')})` : ''}`).join('\n')}
`;

  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma3',
        prompt,
        format: {
          type: 'object',
          properties: {
            intent: { type: 'string' },
            query: { type: 'string' },
            filters: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        stream: false, // Disable streaming to get a single JSON response
      }),
    });

    const data = await res.json();

    return JSON.parse(data.response);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(`Error generating chat query with Ollama: ${errorMessage}`);
  }
}

export async function generateChatResponse({
  intent,
  query,
  filters,
  products,
  history,
}: {
  intent: QueryIntent;
  query: string;
  filters: string[];
  products?: Product[];
  history: { sender: MessageSender; message: string; products?: Product[] }[];
}): Promise<{
  message: string;
  products?: Product[];
}> {
  console.log('Generating chat response with products:', products);

  const isFirstAssistantMessage = !history.some((h) => h.sender === 'bot');

  const prompt = `
You are a product recommendation assistant.

You must respond ONLY to the LAST user message.

PRIMARY GOAL:
Help users find suitable products in a natural, non-repetitive way.

GREETING RULE:
- If this is the FIRST assistant message in the conversation:
  - Start with a short friendly greeting ("Hi!" or "Hello!")
- Otherwise:
  - Do NOT greet
  - Do NOT restart the conversation

CONVERSATION CONTEXT:
- If the user explicitly changes topic or intent (e.g. "forget it", "actually", "I want something else"):
  - Ignore all previous products and preferences
  - Treat the message as a fresh PRODUCT_SEARCH
  - Do NOT greet again

CORE RULES (STRICT):
- Respond ONLY to the last user message
- Never repeat the same product name
- Never list the same product twice
- Never recommend products from rejected categories
- Do NOT invent products
- Do NOT mention internal logic, AI, embeddings, or rules

TURN CONTROL RULES:
- In ONE response, do ONLY ONE of the following:
  A) Ask ONE clarifying question
  B) Recommend products
- NEVER ask a question and recommend products in the same response

INTENT BEHAVIOR:

OFF_TOPIC:
- Respond briefly and politely
- Gently redirect toward product discovery
- Do NOT engage in off-topic discussion

PRODUCT_SEARCH:
- Use ONLY the provided products
- If the request is vague or ambiguous:
  - Ask ONE clarifying question
  - Do NOT recommend products yet
- If relevant products exist:
  - Recommend them
  - Briefly explain why they match the request
- If no relevant products exist:
  - Clearly say so
- Do NOT recommend unrelated products just to have something to recommend

OUTPUT FORMAT RULES:
- Return ONLY valid JSON
- No text outside the JSON object

JSON FORMAT:
{
  "message": "string",
  "related_products": true | false,
  "related_products_names": ["product name"]
}

INPUT:

Is first assistant message:
${isFirstAssistantMessage ? 'YES' : 'NO'}

Intent:
${intent}

User query:
${query}

Filters:
${filters.length > 0 ? filters.join(', ') : 'No filters'}

Products:
${products ? products.map((p) => `- ${p.title}: ${p.description}`).join('\n') : 'No products'}

Conversation history:
${history.map((h) => `${h.sender}: ${h.message}`).join('\n')}
`;

  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma3',
        prompt,
        format: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            related_products: { type: 'boolean' },
            related_products_names: { type: 'array', items: { type: 'string' } },
          },
        },
        stream: false, // Disable streaming to get a single JSON response
      }),
    });

    const data = await res.json();

    const response = JSON.parse(data.response);

    const recommendedProducts = products?.filter((p) => response.related_products_names.includes(p.title)) || [];

    return {
      message: response.message,
      products: recommendedProducts,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(`Error generating chat query with Ollama: ${errorMessage}`);
  }
}
