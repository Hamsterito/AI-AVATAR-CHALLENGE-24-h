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

def save_message(user_message, bot_reply):
    cursor.execute(
        "INSERT INTO messages (user_message, bot_reply) VALUES (%s, %s) RETURNING id;",
        (user_message, bot_reply)
    )
    conn.commit()
    return cursor.fetchone()["id"]

def get_messages():
    cursor.execute("SELECT * FROM messages ORDER BY created_at DESC;")
    return cursor.fetchall()