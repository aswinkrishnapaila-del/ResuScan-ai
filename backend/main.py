import sys
import os
from pathlib import Path

# Ensure backend directory is in sys.path regardless of execution root
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

import time
import uuid
from collections import defaultdict
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from routers import scanner, generator
import uvicorn
import database  # Initialize Supabase resilience checks

app = FastAPI(title="ResuScan AI Platform API", version="2.0.0")

# ─── Sliding-Window Rate Limiter ─────────────────────────────────────────────
# Prevents users/clients from rapidly exhausting AI token quotas and server bandwidth
RATE_LIMIT_WINDOWS = defaultdict(list)
AI_MAX_REQUESTS_PER_MINUTE = 15   # Max AI-heavy calls (scan, improve) per minute per IP
GENERAL_MAX_REQUESTS_PER_MINUTE = 40  # Max other requests per minute per IP

@app.middleware("http")
async def rate_limit_and_cookie_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    path = request.url.path

    # Apply rate limiting to /api endpoints (exclude static / health checks)
    if path.startswith("/api/"):
        window = RATE_LIMIT_WINDOWS[client_ip]
        # Purge timestamps older than 60 seconds
        RATE_LIMIT_WINDOWS[client_ip] = [t for t in window if now - t < 60]
        current_window = RATE_LIMIT_WINDOWS[client_ip]

        # Determine limit threshold
        is_ai_call = any(endpoint in path for endpoint in [
            "/scan", "/improve-resume", "/generate-resume",
            "/interview-questions", "/mock-test", "/job-suggestions"
        ])
        limit = AI_MAX_REQUESTS_PER_MINUTE if is_ai_call else GENERAL_MAX_REQUESTS_PER_MINUTE

        if len(current_window) >= limit:
            retry_after = int(60 - (now - current_window[0])) if current_window else 30
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": {
                        "code": 429,
                        "type": "RATE_LIMIT_EXCEEDED",
                        "message": "Too many requests. Please wait a moment before sending more AI requests.",
                        "retry_after_seconds": max(1, retry_after),
                    }
                },
                headers={"Retry-After": str(max(1, retry_after))}
            )

        # Record this request timestamp
        RATE_LIMIT_WINDOWS[client_ip].append(now)

    # Process request
    response: Response = await call_next(request)

    # Cookie support: Ensure every user session has a persistent resuscan_session cookie
    session_cookie = request.cookies.get("resuscan_session_id")
    if not session_cookie:
        new_session = str(uuid.uuid4())
        response.set_cookie(
            key="resuscan_session_id",
            value=new_session,
            max_age=60 * 60 * 24 * 30,  # 30 days
            httponly=False,  # Allow frontend to inspect session
            samesite="lax",
            path="/"
        )

    # Add rate-limit headers for transparency
    remaining = max(0, AI_MAX_REQUESTS_PER_MINUTE - len(RATE_LIMIT_WINDOWS[client_ip]))
    response.headers["X-RateLimit-Limit"] = str(AI_MAX_REQUESTS_PER_MINUTE)
    response.headers["X-RateLimit-Remaining"] = str(remaining)

    return response

# ─── Custom Error Handlers ───────────────────────────────────────────────────
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "type": "HTTP_EXCEPTION",
                "message": exc.detail or "An error occurred processing your request.",
                "path": request.url.path,
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = [f"{err.get('loc', ['field'])[-1]}: {err.get('msg', 'Invalid')}" for err in exc.errors()]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": 422,
                "type": "VALIDATION_ERROR",
                "message": "; ".join(error_messages) or "Invalid request parameters.",
                "path": request.url.path,
            }
        }
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": 500,
                "type": "SERVER_ERROR",
                "message": "An internal server error occurred. Please try again shortly.",
                "detail": str(exc),
                "path": request.url.path,
            }
        }
    )

# ─── CORS Middleware ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Universal deployability
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Include Routers ─────────────────────────────────────────────────────────
app.include_router(scanner.router, prefix="/api", tags=["scanner"])
app.include_router(generator.router, prefix="/api", tags=["generator"])

@app.get("/")
def health_check():
    """Simple health-check endpoint confirming backend operational status."""
    return {"status": "healthy", "service": "ResuScan AI Platform", "version": "2.0.0"}

@app.get("/health")
def health_alias():
    """Platform health probe endpoint."""
    return health_check()

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
