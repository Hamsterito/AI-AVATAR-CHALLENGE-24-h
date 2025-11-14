from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import edge_tts
from whisper_service import transcribe_audio
from db import save_message, get_chats_from_db, get_chat_messages_from_db
import ollama
import os


app = FastAPI(title="AI Avatar Backend")

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
    chat_id = data.get("chat_id", "")

    if not user_message:
        return {"error": "Нет текста для отправки"}
    
    if not chat_id:
        return {"error": "Не указан ID чата"}

    try:
        response = ollama.chat(
            model="mistral",
            messages=[{"role": "user", "content": user_message}]
        )
        bot_reply = response["message"]["content"]
    except Exception as e:
        return {"error": f"Ошибка Ollama: {str(e)}"}

    msg_id = save_message(chat_id, user_message, bot_reply)

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
@app.get("/chats")
def chats():
    try:
        chats_list = get_chats_from_db()
        return {"Chats": chats_list}
    except Exception as e:
        return {"error": str(e)}


@app.get("/messages/{chat_id}")
def messages(chat_id: str):
    try:
        messages_list = get_chat_messages_from_db(chat_id)
        print("asa",messages_list)
        return {"Chat_messages": messages_list}
    except Exception as e:
        return {"error": str(e)}
    

    
@app.post("/stt")
async def stt(file: UploadFile = File(...)):
    """Speech-to-Text (Whisper)"""
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        text = transcribe_audio(file_path)
        return {"text": text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)