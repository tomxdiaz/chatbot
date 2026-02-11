# Product Recommendation Chatbot

A smart product recommendation system powered by local AI, designed to help users discover products from the Shift Green Hub database through natural conversation and semantic search.

## Overview

This chatbot provides an intelligent interface to explore and discover products using advanced AI capabilities running entirely on your local machine. It combines conversational AI with semantic search to understand user needs and recommend relevant products.

## Features

- **🤖 Conversational AI**: Natural language chatbot that understands user intent and preferences
- **🔍 Semantic Search**: Vector-based search for finding products based on meaning, not just keywords
- **🌱 Shift Green Hub Database**: Access to curated sustainable product catalog
- **🏠 100% Local**: All AI processing runs on your machine using Ollama
- **⚡ Fast & Private**: No data leaves your computer, instant responses

## Technology Stack

- **Framework**: Next.js with TypeScript
- **AI Engine**: Ollama (local LLM runtime)
- **Generation Model**: `gemma3` - For understanding queries and generating responses
- **Embedding Model**: `nomic-embed-text` - For semantic search and product matching
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## Prerequisites

Before running this project, you need to have **Ollama** installed and running on your local machine.

### Installing Ollama

1. Download and install Ollama from [https://ollama.com](https://ollama.com)
2. Verify installation:
   ```bash
   ollama --version
   ```

### Pulling Required Models

Once Ollama is installed, pull both required models:

```bash
# Pull the generation model (for chatbot responses)
ollama pull gemma3

# Pull the embedding model (for semantic search)
ollama pull nomic-embed-text
```

### Verify Ollama is Running

Ollama should be running on the default port **11434**. You can verify by checking:

```bash
curl http://localhost:11434/api/tags
```

If Ollama is not running, start it:

```bash
ollama serve
```

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd chatbot
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Chatbot Interface

The main interface provides an interactive chat where you can:

- Ask for product recommendations by describing what you need
- Specify preferences and filters (colors, price range, categories, etc.)
- Get personalized suggestions based on conversation context
- Explore products through natural conversation

**Example queries:**

- "I'm looking for sustainable kitchen products"
- "Show me eco-friendly water bottles"
- "I need something for outdoor activities"

### Simple Search

The application also includes a simple search feature for direct product queries.

## How It Works

1. **User Input**: User sends a message through the chat interface
2. **Intent Classification**: Gemma3 analyzes the message to understand user intent
3. **Query Extraction**: The system extracts a semantic query optimized for vector search
4. **Embedding Generation**: Nomic-embed-text creates vector embeddings of the query
5. **Semantic Search**: Products are matched based on vector similarity
6. **Response Generation**: Gemma3 generates a natural, contextual response with product recommendations

## Project Structure

```
src/
├── actions/          # Server actions for DB, Ollama, and OpenAI
├── app/              # Next.js app directory
├── components/       # React components
├── hooks/            # Custom React hooks
├── lib/              # Core utilities (DB, Ollama, OpenAI clients)
├── types/            # TypeScript type definitions
└── utils/            # Helper functions
```

## Configuration

The application expects Ollama to be running on `http://localhost:11434` (default port). If you need to change this, update the fetch URLs in:

- `src/lib/ollama.ts`

## Troubleshooting

### Ollama Connection Issues

If you see "Error creando embedding con Ollama" or similar errors:

1. Verify Ollama is running: `curl http://localhost:11434/api/tags`
2. Check that both models are installed: `ollama list`
3. Ensure Ollama is listening on port 11434

### Models Not Found

If Ollama reports that models are missing:

```bash
ollama pull gemma3
ollama pull nomic-embed-text
```

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
