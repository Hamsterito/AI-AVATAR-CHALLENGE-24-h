from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import ollama
import edge_tts
import asyncio
from db import save_message, get_messages
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# uvicorn main:app --reload --port 8000

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message", "")

    if not user_message:
        return {"error": "Нет текста для отправки"}

    try:
        response = ollama.chat(
            model="mistral",
            messages=[{"role": "user", "content": user_message}]
        )
        bot_reply = response["message"]["content"]
    except Exception as e:
        return {"error": f"Ошибка Ollama: {str(e)}"}

    msg_id = save_message(user_message, bot_reply)

    async def stream_audio():
        communicate = edge_tts.Communicate(bot_reply, "ru-RU-DariyaNeural")
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]

    return StreamingResponse(
        stream_audio(),
        media_type="audio/mpeg",
        headers={"X-Message-Id": str(msg_id)}
    )

@app.get("/messages")
async def messages():
    return get_messages()