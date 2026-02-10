'use server';

import { createEmbedding, generateChatQuery, generateChatResponse } from '../lib/ollama';
import { MessageSender, Product } from '../types';
import { searchByQuery } from './db.actions';

export const getEmbedding = async (text: string): Promise<number[]> => {
  const res = await createEmbedding(text);
  return res;
};

export async function getChatResponse(
  message: string,
  history: { sender: MessageSender; message: string; products?: Product[] }[],
): Promise<{ message: string; products?: Product[] }> {
  try {
    console.log('FIRST STEP START: Generating chat query:', message);

    const { intent, query, filters } = await generateChatQuery(message, history);

    console.log('FIRST STEP END: Generated query:', { intent, query, filters });

    let products: Product[] = [];

    if (intent === 'PRODUCT_SEARCH') {
      console.log('SECOND STEP START: Retrieved products:', products);

      const queryString = `Query: ${query}\nFilters: ${filters.join(', ')}`;

      products = await searchByQuery(queryString);

      console.log('SECOND STEP END: Retrieved products:', products);
    } else {
      console.log('Intent is OFF_TOPIC, skipping STEP TWO product search');
    }

    console.log('THIRD STEP START: Generating chat response with intent, query, filters, and products');

    const response = await generateChatResponse({
      intent,
      query,
      filters,
      products,
      history,
    });

    console.log('THIRD STEP END: Chat response generated');

    return {
      message: response.message,
      products: response.products,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`Error in getChatResponse: ${errorMessage}`);

    return {
      message: 'Lo siento, no puedo procesar tu peticion. Vuelve a intentarlo.',
      products: [],
    };
  }
}
