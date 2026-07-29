import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from database.connection import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    repairs = db.execute(text("SELECT id, asset_id, reported_by, issue, status FROM repairs")).fetchall()
    print("All repairs in DB:")
    for r in repairs:
        print(r)
        
    print("\nCheck if employees exist:")
    employees = db.execute(text("SELECT id, name FROM employees LIMIT 10")).fetchall()
    for e in employees:
        print(e)
        
    null_reported_by_count = db.execute(text("SELECT COUNT(*) FROM repairs WHERE reported_by IS NULL")).scalar()
    print(f"\nRepairs with NULL reported_by: {null_reported_by_count}")
finally:
    db.close()
