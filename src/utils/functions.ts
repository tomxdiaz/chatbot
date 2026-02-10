import { WithId, Document } from 'mongodb';
import { Product } from '../types';

export const productToEmbeddingText = (product: Product): string => {
  const embeddingText = `${product.title}. Brand: ${product.brand}. Type: ${product.productType}. Description: ${product.description}. Categories: ${product.collections ? product.collections.join(', ') : ''}`;

  return embeddingText;
};

export const fromMongoProductToProduct = (product: WithId<Document>): Product => {
  return {
    id: product._id.toString(),
    title: product.title as string,
    collections: product.collections as string[],
    description: product.description as string,
    brand: product.brand as string,
    productType: product.productType as string,
    embedding: product.embedding as number[],
  };
};

export const fromMongoProductsToProducts = (products: WithId<Document>[]): Product[] => {
  return products.map((product) => fromMongoProductToProduct(product));
};
