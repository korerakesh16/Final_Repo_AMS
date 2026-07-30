from database.connection import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    cols = db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications'")).fetchall()
    print("Columns:", cols)
    rows = db.execute(text("SELECT id, title, read, pg_typeof(read) FROM notifications ORDER BY created_at DESC LIMIT 10")).fetchall()
    print("Rows:")
    for r in rows:
        print(dict(r._mapping))
finally:
    db.close()
