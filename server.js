const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (replace with actual database in production)
const users = new Map();
const apiKeys = new Map();
const chatSessions = new Map();

// ==================== Authentication Middleware ====================

/**
 * Middleware to verify API Key
 */
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const keyData = apiKeys.get(apiKey);
  if (!keyData || !keyData.active) {
    return res.status(401).json({ error: 'Invalid or inactive API key' });
  }

  req.userId = keyData.userId;
  req.apiKey = apiKey;
  next();
};

/**
 * Middleware to verify JWT Token
 */
const verifyJwt = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ==================== User Management Endpoints ====================

/**
 * Register a new user
 * POST /api/auth/register
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(
      (u) => u.email === email || u.username === username
    );

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const newUser = {
      userId,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true,
    };

    users.set(userId, newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId, username, email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        userId,
        username,
        email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = Array.from(users.values()).find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
app.get('/api/auth/profile', verifyJwt, (req, res) => {
  const user = users.get(req.userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    userId: user.userId,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    active: user.active,
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
app.put('/api/auth/profile', verifyJwt, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = users.get(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) {
      user.username = username;
    }

    if (email) {
      user.email = email;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    user.updatedAt = new Date();
    users.set(req.userId, user);

    res.json({
      message: 'Profile updated successfully',
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Profile update failed', details: error.message });
  }
});

// ==================== API Key Management Endpoints ====================

/**
 * Generate API Key
 * POST /api/keys/generate
 */
app.post('/api/keys/generate', verifyJwt, (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Key name is required' });
    }

    const apiKey = `sk_${uuidv4().replace(/-/g, '')}`;
    const keyData = {
      userId: req.userId,
      name,
      apiKey,
      createdAt: new Date(),
      active: true,
      lastUsed: null,
    };

    apiKeys.set(apiKey, keyData);

    res.status(201).json({
      message: 'API key generated successfully',
      apiKey,
      name,
      createdAt: keyData.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'API key generation failed', details: error.message });
  }
});

/**
 * List API Keys
 * GET /api/keys
 */
app.get('/api/keys', verifyJwt, (req, res) => {
  try {
    const userKeys = Array.from(apiKeys.values())
      .filter((key) => key.userId === req.userId)
      .map((key) => ({
        name: key.name,
        apiKey: key.apiKey.substring(0, 10) + '***',
        createdAt: key.createdAt,
        active: key.active,
        lastUsed: key.lastUsed,
      }));

    res.json(userKeys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve API keys', details: error.message });
  }
});

/**
 * Revoke API Key
 * DELETE /api/keys/:apiKey
 */
app.delete('/api/keys/:apiKey', verifyJwt, (req, res) => {
  try {
    const { apiKey } = req.params;
    const keyData = apiKeys.get(apiKey);

    if (!keyData) {
      return res.status(404).json({ error: 'API key not found' });
    }

    if (keyData.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    keyData.active = false;
    apiKeys.set(apiKey, keyData);

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke API key', details: error.message });
  }
});

// ==================== Chat Endpoints ====================

/**
 * Create a new chat session
 * POST /api/chat/sessions
 */
app.post('/api/chat/sessions', verifyApiKey, (req, res) => {
  try {
    const { title } = req.body;
    const sessionId = uuidv4();

    const session = {
      sessionId,
      userId: req.userId,
      title: title || `Chat ${new Date().toLocaleString()}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    chatSessions.set(sessionId, session);

    res.status(201).json({
      message: 'Chat session created successfully',
      sessionId,
      title: session.title,
      createdAt: session.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chat session', details: error.message });
  }
});

/**
 * Get all chat sessions for user
 * GET /api/chat/sessions
 */
app.get('/api/chat/sessions', verifyApiKey, (req, res) => {
  try {
    const userSessions = Array.from(chatSessions.values())
      .filter((session) => session.userId === req.userId)
      .map((session) => ({
        sessionId: session.sessionId,
        title: session.title,
        messageCount: session.messages.length,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }));

    res.json(userSessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve sessions', details: error.message });
  }
});

/**
 * Get specific chat session with messages
 * GET /api/chat/sessions/:sessionId
 */
app.get('/api/chat/sessions/:sessionId', verifyApiKey, (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    if (session.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve session', details: error.message });
  }
});

/**
 * Send a message to a chat session
 * POST /api/chat/sessions/:sessionId/messages
 */
app.post('/api/chat/sessions/:sessionId/messages', verifyApiKey, (req, res) => {
  try {
    const { sessionId } = req.params;
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required' });
    }

    if (!['user', 'assistant'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "user" or "assistant"' });
    }

    const session = chatSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    if (session.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const message = {
      messageId: uuidv4(),
      role,
      content,
      timestamp: new Date(),
    };

    session.messages.push(message);
    session.updatedAt = new Date();
    chatSessions.set(sessionId, session);

    res.status(201).json({
      message: 'Message sent successfully',
      messageId: message.messageId,
      timestamp: message.timestamp,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

/**
 * Delete a chat session
 * DELETE /api/chat/sessions/:sessionId
 */
app.delete('/api/chat/sessions/:sessionId', verifyApiKey, (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    if (session.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    chatSessions.delete(sessionId);

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session', details: error.message });
  }
});

/**
 * Clear messages from a chat session
 * DELETE /api/chat/sessions/:sessionId/messages
 */
app.delete('/api/chat/sessions/:sessionId/messages', verifyApiKey, (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    if (session.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    session.messages = [];
    session.updatedAt = new Date();
    chatSessions.set(sessionId, session);

    res.json({ message: 'Chat messages cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear messages', details: error.message });
  }
});

// ==================== Health Check ====================

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ==================== Error Handling ====================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ==================== Server Startup ====================

app.listen(PORT, () => {
  console.log(`🚀 Cyanix AI Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 API Authentication: Enabled`);
});

module.exports = app;
