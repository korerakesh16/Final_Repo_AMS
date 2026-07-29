from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

db_url = settings.DATABASE_URL.strip()
if db_url.startswith("DATABASE_URL="):
    db_url = db_url[len("DATABASE_URL="):].strip()
if (db_url.startswith('"') and db_url.endswith('"')) or (db_url.startswith("'") and db_url.endswith("'")):
    db_url = db_url[1:-1].strip()

# Create engine with pool connection settings
engine = create_engine(
    db_url,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
