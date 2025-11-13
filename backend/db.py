import psycopg2
from psycopg2.extras import RealDictCursor

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "ai_chat"
DB_USER = "postgres"
DB_PASSWORD = "123"

conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD
)

cursor = conn.cursor(cursor_factory=RealDictCursor)

def save_message(chat_id, user_message, bot_reply):
    cursor.execute(
        "INSERT INTO messages (id_chats, user_message, bot_reply) VALUES (%s, %s, %s) RETURNING id;",
        (chat_id, user_message, bot_reply)
    )
    conn.commit()
    return cursor.fetchone()["id"]

def get_chat_messages(chat_id):
    cursor.execute(
        "SELECT * FROM messages WHERE id_chats = %s ORDER BY created_at ASC;",
        (chat_id,)
    )
    return cursor.fetchall()

def get_chats():
    cursor.execute("""
        SELECT 
            id_chats,
            MIN(user_message) as first_message,
            MIN(created_at) as created_at,
            COUNT(*) as message_count
        FROM messages 
        GROUP BY id_chats 
        ORDER BY MIN(created_at) DESC;
    """)
    return cursor.fetchall()
