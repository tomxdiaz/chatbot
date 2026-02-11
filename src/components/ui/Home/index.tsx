'use client';
import { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { embedAllProducts, searchByQuery } from '../../../actions/db.actions';
import { useDebounce } from '../../../hooks/useDebounce';
import Chat from './Chat';

const Home = () => {
  const [query, setQuery] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim()) {
        const products = await searchByQuery(debouncedQuery);
        setRecommendedProducts(products);
      } else {
        setRecommendedProducts([]);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return (
    <div className='max-w-150 flex flex-col gap-4'>
      <button
        onClick={async () => {
          await embedAllProducts();
        }}>
        Embed All Products
      </button>

      <input
        className='border p-2 rounded'
        type='text'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Type to search...'
      />

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

      <div className='w-full h-0.5 bg-white ' />

      <Chat />
    </div>
  );
};

export default Home;
