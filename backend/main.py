from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import scanner, generator
import uvicorn

app = FastAPI(title="AI Resume Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(scanner.router, prefix="/api", tags=["scanner"])
app.include_router(generator.router, prefix="/api", tags=["generator"])

@app.get("/")
def health_check():
    """Simple health-check endpoint to confirm the server is running."""
    return {"status": "healthy", "message": "AI Resume Platform Backend is running!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
