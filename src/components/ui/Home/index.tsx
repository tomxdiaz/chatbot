'use client';
import { useState } from 'react';
import { Product } from '../../../types';
import { embedAllProducts, searchByQuery } from '../../../actions/db.actions';
import Chat from './Chat';

const Home = () => {
  const [query, setQuery] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  return (
    <div className='max-w-150 flex flex-col gap-4'>
      <button
        onClick={async () => {
          await embedAllProducts();
        }}>
        Embed All Products
      </button>

      <input className='border p-2 rounded' type='text' value={query} onChange={(e) => setQuery(e.target.value)} />

      <button
        className='border-2 border-white hover:bg-yellow-500 text-white hover:text-black font-bold py-2 px-4 rounded'
        onClick={async () => {
          const products = await searchByQuery(query);
          setRecommendedProducts(products);
        }}>
        Search by query
      </button>

      {recommendedProducts && recommendedProducts.length > 0 && (
        <div className='border-2 border-white p-2 rounded'>
          {recommendedProducts.map((product) => (
            <div key={product.id} className='border-b border-yellow p-2'>
              <h3 className='font-bold'>{product.title}</h3>
              <p>{product.description.slice(0, 100)}...</p>
              <p className='italic text-sm'>Score: {product.score}</p>
            </div>
          ))}
        </div>
      )}

      <div className='w-full bg-white h-10' />

      <Chat />
    </div>
  );
};

export default Home;
