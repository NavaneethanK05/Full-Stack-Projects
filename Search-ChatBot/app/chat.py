import os
import logging
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from .tools import search

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Validate required environment variables
required_vars = ["GROQ_API_KEY", "TAVILY_API_KEY"]
for var in required_vars:
    if not os.getenv(var):
        raise ValueError(f"Missing required environment variable: {var}")

# Simple conversational system prompt
SYSTEM_PROMPT = """You are a helpful AI assistant with web search capabilities.

IMPORTANT - Keep responses concise:
- Greetings: 1 short sentence (e.g., "Hello! How can I help you today?")
- Self-introduction: 1-2 sentences max
- General knowledge: Brief and direct answers
- For current info (weather, news, recent events): Use web search tool and provide clear summary

Only search when you need current/real-time information. Be friendly but brief."""

# Create the prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# Initialize the ChatGroq model with streaming
model = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3,  # Lower temperature for more focused responses
    streaming=True,
    max_tokens=512,  # Limit token length for conciseness
)

# Create the tool calling agent (simpler than ReAct)
agent = create_tool_calling_agent(
    llm=model,
    tools=[search],
    prompt=prompt
)

# Create the agent executor
agent_executor = AgentExecutor(
    agent=agent,
    tools=[search],
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=3,
    return_intermediate_steps=True
)

logger.info("Agent initialized successfully")