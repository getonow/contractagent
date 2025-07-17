from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Minimal CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/test")
async def test_post(request: Request):
    return {"message": "POST request received", "method": request.method}

@app.post("/test-json")
async def test_json():
    return {"message": "JSON POST request received"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3001) 