'use server';

// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const createEmbedding = async (text: string) => {
//   console.log('Creating embedding for text: ', text);

//   const res = await openai.embeddings.create({
//     model: 'text-embedding-3-small', // 1536 dimensions
//     input: text,
//   });

//   console.log('Embedding created: ', res);

//   return res.data[0].embedding;
// };
