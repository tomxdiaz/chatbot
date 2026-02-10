'use server';

import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import { fromMongoProductsToProducts } from '../utils/functions';
import { Product } from '../types';
import { createEmbedding } from './ollama';

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

const mongodbUser = process.env.MONGODB_USER;
const mongodbPassword = process.env.MONGODB_PASSWORD;

const uri = `mongodb+srv://${mongodbUser}:${mongodbPassword}@cluster0.kg256ci.mongodb.net/?appName=Cluster0`;

// Global client cache (prevents hot-reload connection issues in dev)
let client: MongoClient;

if (!global.mongoClientPromise) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      deprecationErrors: true,
    },
  });
  global.mongoClientPromise = client.connect();
}

const clientPromise = global.mongoClientPromise;

const getClient = async () => {
  return await clientPromise;
};

export const getAllProducts = async (): Promise<Product[]> => {
  const client = await getClient();
  const db = client.db('chatbot');
  const collection = db.collection('products');
  const products = await collection.find().toArray();
  return fromMongoProductsToProducts(products);
};

export async function searchProducts(query: string): Promise<Product[]> {
  const queryEmbedding = await createEmbedding(query);

  const client = await getClient();
  const db = client.db('chatbot');
  const collection = db.collection('products');

  const products = await collection
    .aggregate([
      {
        $vectorSearch: {
          index: 'vector', // Defined in MongoDB "Search & Vector Search"
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: 5,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          title: 1,
          brand: 1,
          productType: 1,
          collections: 1,
          description: 1,
          category: 1,
          embedding: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ])
    .toArray();

  console.log('Raw search results from MongoDB:', products);

  return products.map((product) => ({
    id: product._id.toString(),
    name: product.name as string,
    title: product.title as string,
    brand: product.brand as string,
    productType: product.productType as string,
    collections: product.collections as string[],
    description: product.description as string,
    category: product.category as string,
    embedding: product.embedding as number[],
    score: product.score as number,
  }));
}

export const updateProductsWithEmbedding = async (products: Product[]) => {
  const client = await getClient();
  const db = client.db('chatbot');
  const collection = db.collection('products');

  const bulkOps = products.map((product) => ({
    replaceOne: {
      filter: { _id: new ObjectId(product.id) },
      replacement: {
        embedding: product.embedding,
      },
    },
  }));

  const res = await collection.bulkWrite(bulkOps);
  return res;
};
