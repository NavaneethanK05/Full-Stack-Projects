import os
from dotenv import load_dotenv
from tavily import TavilyClient
from langchain.tools import tool

# Load environment variables
load_dotenv()

# Initialize Tavily client
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

@tool("web_search")
def search(query: str) -> str:
    """Search the web for current information on any topic.

    Args:
        query: The search query to look up on the web

    Returns:
        A formatted string containing search results with sources
    """
    try:
        # Perform the search with Tavily
        response = tavily_client.search(
            query=query,
            search_depth="advanced",
            max_results=5,
            include_answer=True
        )

        # Format the results
        if response.get('answer'):
            result = f"Answer: {response['answer']}\n\n"
        else:
            result = ""

        result += "Sources:\n"
        for idx, source in enumerate(response.get('results', []), 1):
            result += f"{idx}. {source['title']}\n"
            result += f"   URL: {source['url']}\n"
            result += f"   {source['content'][:200]}...\n\n"

        return result
    except Exception as e:
        return f"Error performing search: {str(e)}"


