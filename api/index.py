from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

# Debug: Check environment before loading .env
print("[DEBUG] Before load_dotenv():")
print(f"  OPENAI_API_KEY in os.environ: {'OPENAI_API_KEY' in os.environ}")
if 'OPENAI_API_KEY' in os.environ:
    key = os.environ.get('OPENAI_API_KEY', '')
    print(f"  OPENAI_API_KEY length: {len(key)}")
    print(f"  OPENAI_API_KEY first 10 chars: {key[:10]}...")

# Load .env file - override=True ensures environment variables override .env file values
# This is important if the variable is already set in the environment
env_loaded = load_dotenv(override=True)
print(f"[DEBUG] load_dotenv(override=True) returned: {env_loaded}")
print(f"[DEBUG] Current working directory: {os.getcwd()}")
print(f"[DEBUG] .env file exists: {os.path.exists('.env')}")

# Debug: Check environment after loading .env
print("[DEBUG] After load_dotenv():")
print(f"  OPENAI_API_KEY in os.environ: {'OPENAI_API_KEY' in os.environ}")
api_key_after = os.getenv("OPENAI_API_KEY")
if api_key_after:
    print(f"  OPENAI_API_KEY length: {len(api_key_after)}")
    print(f"  OPENAI_API_KEY first 10 chars: {api_key_after[:10]}...")
else:
    print("  OPENAI_API_KEY is None or empty")
    print(f"  All env vars starting with OPENAI: {[k for k in os.environ.keys() if k.startswith('OPENAI')]}")

app = FastAPI()

# CORS so the frontend can talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize OpenAI client lazily to avoid errors if API key is not set at startup
def get_openai_client():
    """Get or create OpenAI client instance"""
    print("[DEBUG] get_openai_client() called")
    api_key = os.getenv("OPENAI_API_KEY")
    print(f"[DEBUG] os.getenv('OPENAI_API_KEY') result: {api_key is not None}, length: {len(api_key) if api_key else 0}")
    if not api_key:
        print("[DEBUG] API key is None or empty, returning None")
        return None
    print(f"[DEBUG] Creating OpenAI client with key starting with: {api_key[:10]}...")
    return OpenAI(api_key=api_key)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/api/chat")
def chat(request: ChatRequest):
    print("[DEBUG] /api/chat endpoint called")
    print(f"[DEBUG] os.environ keys containing 'OPENAI': {[k for k in os.environ.keys() if 'OPENAI' in k.upper()]}")
    
    api_key = os.getenv("OPENAI_API_KEY")
    print(f"[DEBUG] os.getenv('OPENAI_API_KEY') result: {api_key is not None}")
    if api_key:
        print(f"[DEBUG] API key length: {len(api_key)}, first 10 chars: {api_key[:10]}...")
    else:
        print("[DEBUG] API key is None or empty")
        print(f"[DEBUG] All environment variables: {list(os.environ.keys())[:20]}...")  # First 20 keys
    
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")
    
    client = get_openai_client()
    if not client:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")
    
    try:
        user_message = request.message
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a supportive mental coach."},
                {"role": "user", "content": user_message}
            ]
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling OpenAI API: {str(e)}")
