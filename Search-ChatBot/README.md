# AI Web Search ChatBot

An intelligent chatbot powered by LangChain and Groq that searches the web in real-time to answer your questions. Features a modern, responsive UI with streaming responses.

## Features

- **Real-time Web Search**: Searches the web using Tavily API for up-to-date information
- **Streaming Responses**: See answers appear token-by-token as the AI thinks
- **Modern UI**: Beautiful purple gradient design with smooth animations
- **ReAct Agent**: Uses LangChain's ReAct pattern for intelligent tool usage
- **Fast & Accurate**: Powered by Groq's llama-3.1-8b-instant model
- **Production Ready**: Error handling, logging, validation, and health checks

## Technologies Used

- **Backend**: FastAPI with async/await support
- **AI Framework**: LangChain v0.3 + LangGraph v0.2
- **LLM Provider**: Groq (llama-3.1-8b-instant)
- **Search Tool**: Tavily API (advanced web search)
- **Frontend**: Vanilla JavaScript with Server-Sent Events (SSE)
- **Styling**: Modern CSS with responsive design

## Prerequisites

- Python 3.9 or higher
- Groq API key (free at [console.groq.com](https://console.groq.com))
- Tavily API key (free at [tavily.com](https://tavily.com))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Search-ChatBot
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   Create a `.env` file in the project root:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   ```

   To get API keys:
   - **Groq**: Sign up at [console.groq.com](https://console.groq.com) and create an API key
   - **Tavily**: Sign up at [tavily.com](https://tavily.com) and get your API key

## Usage

1. **Start the server**
   ```bash
   python main.py
   ```

   The server will start at `http://localhost:8000`

2. **Open in browser**

   Navigate to `http://localhost:8000` and start chatting!

3. **API Documentation**

   FastAPI provides automatic API docs at `http://localhost:8000/docs`

## Project Structure

```
Search-ChatBot/
├── app/
│   ├── __init__.py          # Package initialization
│   ├── chat.py              # Agent configuration and setup
│   ├── models.py            # Pydantic models for request/response
│   └── tools.py             # Tavily web search tool
├── static/
│   ├── script.js            # Frontend JavaScript (SSE handling)
│   └── style.css            # Modern UI styles
├── templates/
│   └── index.html           # Chat interface HTML
├── .env                     # Environment variables (create this)
├── main.py                  # FastAPI application and streaming endpoint
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## How It Works

1. **User Input**: User types a question in the chat interface
2. **API Request**: Frontend sends POST request to `/chat/stream`
3. **Agent Processing**:
   - LangChain ReAct agent analyzes the question
   - Decides if web search is needed
   - Calls Tavily search tool if necessary
   - Synthesizes information into a response
4. **Streaming Response**: Backend streams response via Server-Sent Events (SSE)
5. **UI Updates**: Frontend displays tokens in real-time as they arrive

## API Endpoints

### `GET /`
Serves the chat UI (HTML page)

### `POST /chat/stream`
Streams chat responses using Server-Sent Events

**Request Body:**
```json
{
  "input_text": "What's the weather in San Francisco?"
}
```

**Response:** SSE stream with events:
- `start`: Streaming begins
- `token`: Individual response tokens
- `tool_start`: Web search initiated
- `tool_end`: Web search completed
- `done`: Response complete
- `error`: Error occurred

### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "AI Web Search ChatBot",
  "version": "1.0.0"
}
```

## Configuration

### Environment Variables

- `GROQ_API_KEY`: Your Groq API key (required)
- `TAVILY_API_KEY`: Your Tavily API key (required)

### Model Configuration

To change the LLM model, edit `app/chat.py`:

```python
model = ChatGroq(
    model="llama-3.1-8b-instant",  # Change model here
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.7,  # Adjust creativity (0.0-1.0)
    streaming=True,
    max_tokens=1024,  # Maximum response length
)
```

Available Groq models:
- `llama-3.1-8b-instant` (default, fastest)
- `llama-3.1-70b-versatile` (more capable, slower)
- `mixtral-8x7b-32768` (alternative option)

### Search Configuration

To adjust search behavior, edit `app/tools.py`:

```python
response = tavily_client.search(
    query=query,
    search_depth="advanced",  # "basic" or "advanced"
    max_results=5,           # Number of search results
    include_answer=True      # Include AI-generated answer
)
```

## Troubleshooting

### Server won't start

**Problem**: `ValueError: Missing required environment variable`

**Solution**: Make sure you have a `.env` file with valid API keys

### No responses streaming

**Problem**: Messages sent but no response appears

**Solution**:
- Check browser console for errors
- Verify API keys are valid
- Check server logs for errors

### CORS errors in browser

**Problem**: `Access-Control-Allow-Origin` errors

**Solution**: CORS is configured to allow all origins. If issues persist, check browser extensions or network settings.

### Search tool not working

**Problem**: Agent doesn't search or returns errors

**Solution**:
- Verify Tavily API key is correct
- Check Tavily API usage limits
- Review server logs for detailed error messages

### Slow responses

**Problem**: Responses take a long time to appear

**Solution**:
- Try a faster model (e.g., llama-3.1-8b-instant)
- Reduce `max_results` in search configuration
- Check your internet connection
- Groq API may be experiencing high load

## Development

### Running in development mode

The server runs with auto-reload enabled by default:

```bash
python main.py
```

### Running with uvicorn directly

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Logging

Logs are output to console with timestamps. To adjust log level, edit `main.py` and `app/chat.py`:

```python
logging.basicConfig(level=logging.DEBUG)  # Change to DEBUG for verbose logs
```

## License

MIT License - feel free to use this project for your own applications

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

- [LangChain](https://python.langchain.com/) - AI application framework
- [Groq](https://groq.com/) - Fast LLM inference
- [Tavily](https://tavily.com/) - Web search API
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review server logs for error details
3. Open an issue on GitHub

---

**Built with LangChain v0.3, LangGraph v0.2, and modern web technologies**
