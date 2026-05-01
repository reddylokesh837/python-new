from fastapi import FastAPI
from routes import router

app = FastAPI(title="My Fullstack App")

app.include_router(router)

@app.get("/")
def root():
    return {"message": "Backend is running!"}
