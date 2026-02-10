'use server';

import { getAllProducts, searchProducts, updateProductsWithEmbedding } from '../lib/db';
import { getEmbedding } from './ollama.actions';
import { productToEmbeddingText } from '../utils/functions';
import { Product } from '../types';

export const searchByQuery = async (query: string): Promise<Product[]> => {
  const products = await searchProducts(query);

  return products;
};

export const embedAllProducts = async () => {
  const products = await getAllProducts();

  const embeddedProducts = await Promise.all(
    products.map(async (product) => {
      const embeddingText = productToEmbeddingText(product);
      return {
        ...product,
        embedding: await getEmbedding(embeddingText),
      };
    }),
  );

  await updateProductsWithEmbedding(embeddedProducts);

  return { success: true, count: embeddedProducts.length };
};
