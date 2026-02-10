import { useState } from 'react';
import { getChatResponse } from '../../../actions/ollama.actions';
import { MessageSender, Product } from '../../../types';

const Chat = () => {
  const [messageHistory, setMessageHistory] = useState<{ sender: MessageSender; message: string; products?: Product[] }[]>([]);
  const [currentMessage, setCurrentMessage] = useState({ text: '', products: [] as Product[] });
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    setMessageHistory((prev) => [...prev, { sender: 'user', message: currentMessage.text }]);

    setIsLoading(true);

    setCurrentMessage({ text: '', products: [] });

    console.log(
      'Historial de mensajes:',
      messageHistory.map(
        (h) =>
          `${h.sender}: ${h.message}${h.products && h.products.length > 0 ? ` (Products: ${h.products.map((p) => 'Title: ' + p.title + ' - Description: ' + p.description).join(' / ')})` : ''}`,
      ),
    );

    const { message, products } = await getChatResponse(currentMessage.text, messageHistory);

    setIsLoading(false);

    setMessageHistory((prev) => [...prev, { sender: 'bot', message, products }]);
  };

  return (
    <div className='flex flex-col gap-4'>
      {messageHistory.map((entry, index) => (
        <div
          key={index}
          className={`flex flex-col p-2 my-1 rounded ${entry.sender === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 text-black self-start'}`}>
          {entry.message}
          {entry.products && entry.products.length > 0 && (
            <div className='flex flex-col gap-2 my-2'>
              {entry.products.map((product) => (
                <div key={product.id} className='border-2 border-black rounded p-2'>
                  <p>{product.title}</p>
                  <p className='text-sm ml-2'>{product.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {isLoading && <div className='p-2 my-1 rounded bg-yellow-500 text-black self-start'>Bot is typing...</div>}

      <form
        className='w-full flex flex-col'
        action='submit'
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}>
        <input
          className='w-full border p-2 rounded'
          type='text'
          value={currentMessage.text}
          onChange={(e) => setCurrentMessage({ ...currentMessage, text: e.target.value })}
        />
        <button>Send</button>
      </form>
    </div>
  );
};

export default Chat;
