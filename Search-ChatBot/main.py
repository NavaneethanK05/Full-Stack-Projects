import json
import logging
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.models import Request
from app.chat import agent_executor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Web Search ChatBot",
    description="An intelligent chatbot that searches the web to answer your questions",
    docs_url="/docs",
    openapi_url="/openapi.json",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    """Serve the chat UI"""
    template_path = Path(__file__).parent / "templates" / "index.html"
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(
            content="<h1>Error: Frontend template not found</h1>",
            status_code=500
        )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        content={
            "status": "healthy",
            "service": "AI Web Search ChatBot",
            "version": "1.0.0"
        }
    )


async def generate_sse_stream(user_message: str) -> AsyncGenerator[str, None]:
    """Generate Server-Sent Events stream for agent responses"""
    try:
        # Send start event
        yield f"data: {json.dumps({'type': 'start'})}\n\n"

        # Track if we're in a tool call
        current_tool = None
        full_response = ""

        # Stream events from the agent
        async for event in agent_executor.astream_events(
            {"input": user_message},
            version="v2"
        ):
            kind = event["event"]

            # Handle chat model streaming
            if kind == "on_chat_model_stream":
                chunk = event.get("data", {}).get("chunk")
                if chunk and hasattr(chunk, "content"):
                    content = chunk.content
                    if content:
                        full_response += content
                        yield f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"

            # Handle tool start
            elif kind == "on_tool_start":
                tool_name = event.get("name", "")
                tool_input = event.get("data", {}).get("input", {})
                current_tool = tool_name

                logger.info(f"Tool started: {tool_name} with input: {tool_input}")

                yield f"data: {json.dumps({'type': 'tool_start', 'tool': tool_name, 'input': tool_input})}\n\n"

            # Handle tool end
            elif kind == "on_tool_end":
                tool_output = event.get("data", {}).get("output", "")

                logger.info(f"Tool completed: {current_tool}")

                yield f"data: {json.dumps({'type': 'tool_end', 'tool': current_tool, 'output': str(tool_output)[:200]})}\n\n"
                current_tool = None

        # Send completion event
        yield f"data: {json.dumps({'type': 'done', 'full_response': full_response})}\n\n"

    except Exception as e:
        logger.error(f"Error in stream generation: {str(e)}", exc_info=True)
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"


@app.post("/chat/stream")
async def stream_chat_request(request: Request):
    """Stream chat responses using Server-Sent Events"""
    try:
        logger.info(f"Received chat request: {request.input_text}")

        return StreamingResponse(
            generate_sse_stream(request.input_text),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )

    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

