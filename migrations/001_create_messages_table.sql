-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536), -- For OpenAI embeddings
  metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create vector index
CREATE INDEX ON messages USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100); 