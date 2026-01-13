# Cyanix AI

A comprehensive AI-powered application designed to provide intelligent solutions with an intuitive API and robust feature set.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [API Usage](#api-usage)
- [Configuration](#configuration)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## 🎯 Overview

Cyanix AI is a modern AI framework that offers seamless integration, powerful capabilities, and easy-to-use APIs for developers. Whether you're building intelligent chatbots, content generation tools, or automated decision systems, Cyanix AI provides the foundation you need.

### Key Highlights

- ✨ State-of-the-art AI capabilities
- 🔌 Easy-to-integrate REST API
- 📊 Real-time processing
- 🛡️ Enterprise-grade security
- 🚀 High-performance infrastructure
- 📈 Scalable architecture

## ✨ Features

### Core Features

1. **Natural Language Processing**
   - Advanced text understanding and analysis
   - Multi-language support
   - Sentiment analysis
   - Entity recognition

2. **AI Chat & Conversations**
   - Context-aware responses
   - Conversational memory
   - Custom personality configurations
   - Real-time streaming responses

3. **Content Generation**
   - Text generation from prompts
   - Summarization capabilities
   - Translation services
   - Code generation assistance

4. **Data Analysis**
   - Pattern recognition
   - Anomaly detection
   - Predictive analytics
   - Statistical insights

5. **Authentication & Security**
   - API key management
   - OAuth 2.0 support
   - Rate limiting
   - Request encryption

6. **Monitoring & Analytics**
   - Usage metrics
   - Performance tracking
   - Error logging
   - Custom dashboards

## 🛠️ Setup & Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)
- API credentials for Cyanix AI services

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/suprosmith-coder/Cyanix_Ai.git
   cd Cyanix_Ai
   ```

2. **Create a Virtual Environment**
   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

5. **Initialize the Application**
   ```bash
   python setup.py
   ```

6. **Run the Application**
   ```bash
   python main.py
   ```

### Docker Setup (Optional)

```bash
# Build the Docker image
docker build -t cyanix-ai .

# Run the container
docker run -p 8000:8000 --env-file .env cyanix-ai
```

## 🔌 API Usage

### Authentication

All API requests require authentication using an API key:

```bash
Authorization: Bearer YOUR_API_KEY
```

### Base URL

```
https://api.cyanix.ai/v1
```

### Core Endpoints

#### 1. Chat Completions

**Endpoint:** `POST /chat/completions`

**Request:**
```json
{
  "model": "cyanix-gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150
}
```

**Response:**
```json
{
  "id": "chat-12345",
  "object": "chat.completion",
  "created": 1673000000,
  "model": "cyanix-gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

#### 2. Text Completions

**Endpoint:** `POST /completions`

**Request:**
```json
{
  "model": "cyanix-text",
  "prompt": "The future of AI is",
  "max_tokens": 100,
  "temperature": 0.8
}
```

**Response:**
```json
{
  "id": "cmpl-12345",
  "object": "text_completion",
  "created": 1673000000,
  "model": "cyanix-text",
  "choices": [
    {
      "text": " bright and full of possibilities...",
      "index": 0,
      "finish_reason": "length"
    }
  ],
  "usage": {
    "prompt_tokens": 5,
    "completion_tokens": 8,
    "total_tokens": 13
  }
}
```

#### 3. Embeddings

**Endpoint:** `POST /embeddings`

**Request:**
```json
{
  "model": "cyanix-embed",
  "input": "Hello, how are you?"
}
```

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [0.123, -0.456, 0.789, ...],
      "index": 0
    }
  ],
  "model": "cyanix-embed",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}
```

#### 4. Sentiment Analysis

**Endpoint:** `POST /sentiment`

**Request:**
```json
{
  "text": "I absolutely love this product!",
  "language": "en"
}
```

**Response:**
```json
{
  "sentiment": "positive",
  "confidence": 0.98,
  "scores": {
    "positive": 0.98,
    "neutral": 0.01,
    "negative": 0.01
  }
}
```

#### 5. Text Summarization

**Endpoint:** `POST /summarize`

**Request:**
```json
{
  "text": "Long document text here...",
  "length": "short",
  "language": "en"
}
```

**Response:**
```json
{
  "summary": "Concise summary of the document...",
  "original_length": 1000,
  "summary_length": 150,
  "compression_ratio": 0.15
}
```

### Request Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `model` | string | Model identifier | Yes |
| `messages`/`prompt` | array/string | Input data | Yes |
| `temperature` | float | Controls randomness (0-1) | No |
| `max_tokens` | integer | Maximum output length | No |
| `top_p` | float | Nucleus sampling parameter | No |
| `frequency_penalty` | float | Reduces repetition | No |
| `presence_penalty` | float | Encourages new topics | No |

### Python SDK Example

```python
from cyanix import Cyanix

# Initialize client
client = Cyanix(api_key="your_api_key")

# Chat completions
response = client.chat.completions.create(
    model="cyanix-gpt-4",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum computing"}
    ],
    temperature=0.7
)

print(response.choices[0].message.content)

# Sentiment analysis
sentiment = client.sentiment.analyze(
    text="This is fantastic!",
    language="en"
)

print(f"Sentiment: {sentiment.sentiment}")
print(f"Confidence: {sentiment.confidence}")

# Text summarization
summary = client.text.summarize(
    text="Your long text here...",
    length="medium"
)

print(summary.summary)
```

### JavaScript/Node.js Example

```javascript
const { Cyanix } = require('cyanix-sdk');

const client = new Cyanix({
  apiKey: 'your_api_key'
});

// Chat completions
async function chat() {
  const response = await client.chat.completions.create({
    model: 'cyanix-gpt-4',
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    temperature: 0.7
  });
  
  console.log(response.choices[0].message.content);
}

// Sentiment analysis
async function analyzeSentiment() {
  const result = await client.sentiment.analyze({
    text: 'This product is amazing!',
    language: 'en'
  });
  
  console.log(`Sentiment: ${result.sentiment}`);
}

chat();
analyzeSentiment();
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
CYANIX_API_KEY=your_api_key_here
CYANIX_API_URL=https://api.cyanix.ai/v1
CYANIX_MODEL=cyanix-gpt-4

# Application Settings
APP_NAME=Cyanix_Ai
APP_VERSION=1.0.0
DEBUG=False
LOG_LEVEL=INFO

# Server Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=4

# Database (Optional)
DATABASE_URL=sqlite:///cyanix.db

# Rate Limiting
RATE_LIMIT=100
RATE_LIMIT_PERIOD=3600

# Security
CORS_ORIGINS=["http://localhost:3000", "https://example.com"]
SECRET_KEY=your_secret_key_here
```

### Configuration File (config.yaml)

```yaml
app:
  name: Cyanix_Ai
  version: 1.0.0
  debug: false

api:
  key: ${CYANIX_API_KEY}
  url: https://api.cyanix.ai/v1
  timeout: 30
  retries: 3

models:
  default: cyanix-gpt-4
  available:
    - cyanix-gpt-4
    - cyanix-text
    - cyanix-embed

server:
  host: 0.0.0.0
  port: 8000
  workers: 4

logging:
  level: INFO
  format: json
  file: logs/app.log
```

## 👨‍💻 Development

### Project Structure

```
Cyanix_Ai/
├── src/
│   ├── cyanix/
│   │   ├── __init__.py
│   │   ├── client.py
│   │   ├── models.py
│   │   └── api/
│   │       ├── chat.py
│   │       ├── completions.py
│   │       └── embeddings.py
│   ├── utils/
│   │   ├── logger.py
│   │   └── config.py
│   └── main.py
├── tests/
│   ├── test_chat.py
│   ├── test_completions.py
│   └── test_api.py
├── docs/
│   ├── api.md
│   └── examples.md
├── requirements.txt
├── setup.py
├── .env.example
└── README.md
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run all tests
pytest

# Run with coverage
pytest --cov=src tests/

# Run specific test file
pytest tests/test_chat.py -v
```

### Building & Deployment

```bash
# Build the package
python setup.py build

# Create distribution
python setup.py sdist bdist_wheel

# Upload to PyPI
twine upload dist/*

# Deploy with Docker
docker build -t suprosmith-coder/cyanix-ai:latest .
docker push suprosmith-coder/cyanix-ai:latest
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow PEP 8 style guide
- Write unit tests for new features
- Update documentation accordingly
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

### Getting Help

- **Documentation:** Check our [documentation](./docs) folder
- **Issues:** Report bugs on [GitHub Issues](https://github.com/suprosmith-coder/Cyanix_Ai/issues)
- **Discussions:** Join our [GitHub Discussions](https://github.com/suprosmith-coder/Cyanix_Ai/discussions)
- **Email:** support@cyanix.ai

### FAQ

**Q: How do I get an API key?**
A: Sign up at https://cyanix.ai/signup to obtain your API key.

**Q: What models are available?**
A: See the [Features](#features) section for available models and their capabilities.

**Q: Is there a free tier?**
A: Yes! We offer a free tier with limited requests. Check our pricing page for details.

**Q: How do I report bugs?**
A: Open an issue on GitHub with a detailed description and reproduction steps.

---

**Last Updated:** 2026-01-13  
**Maintained by:** [suprosmith-coder](https://github.com/suprosmith-coder)

Made with ❤️ by the Cyanix AI Team
