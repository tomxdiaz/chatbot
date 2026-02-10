export type Product = {
  id: string;
  title: string;
  brand: string;
  productType: string;
  collections: string[];
  description: string;
  embedding: number[];
  score?: number;
};

export type MessageSender = 'user' | 'bot';

export type QueryIntent = 'PRODUCT_SEARCH' | 'OFF_TOPIC';
