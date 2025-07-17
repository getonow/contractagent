from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class TestRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/test")
def test_post(request: TestRequest):
    return {"received": request.message}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000) 