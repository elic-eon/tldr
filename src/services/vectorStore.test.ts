import { PostgresVectorStore } from './vectorStore';
import { Pool } from 'pg';

// Mock OpenAIEmbeddings
jest.mock('./embeddings', () => ({
  OpenAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedDocuments: jest.fn().mockResolvedValue([[1, 2, 3]]),
    embedQuery: jest.fn().mockResolvedValue([1, 2, 3]),
  })),
}));

describe('PostgresVectorStore', () => {
  let store: PostgresVectorStore;
  let mockClient: any;
  let mockPool: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock client
    mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    };

    // Create mock pool
    mockPool = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      connect: jest.fn().mockResolvedValue(mockClient),
    };

    // Mock Pool constructor
    (Pool as unknown as jest.Mock) = jest.fn().mockImplementation(() => mockPool);

    store = new PostgresVectorStore();
  });

  it('should initialize with correct ENV configuration', () => {
    expect(Pool).toHaveBeenCalledWith({
      host: 'localhost',
      port: 54320,
      database: 'test_db',
      user: 'test_user',
      password: 'test_password',
    });
  });

  it('should handle document addition', async () => {
    await store.addDocuments([{
      pageContent: 'test content',
      metadata: { test: 'metadata' }
    }]);

    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO messages'),
      expect.arrayContaining(['test content'])
    );
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('should handle transaction rollback on error', async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error('DB Error')); // INSERT

    await expect(store.addDocuments([{
      pageContent: 'test content',
      metadata: { test: 'metadata' }
    }])).rejects.toThrow('DB Error');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });
}); 