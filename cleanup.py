import os
from dotenv import load_dotenv
load_dotenv()

from backend.db import engine
from backend.models import Recipe
from sqlalchemy.orm import Session
from sqlalchemy import func

def remove_duplicates():
    print("Connecting to database...")
    with Session(engine) as session:
        recipes = session.query(Recipe).order_by(Recipe.id).all()
        seen = set()
        deleted_count = 0
        
        for r in recipes:
            norm = r.name.strip().lower()
            if norm in seen:
                print(f"Deleting duplicate: '{r.name}' (ID: {r.id})")
                session.delete(r)
                deleted_count += 1
            else:
                seen.add(norm)
                
        session.commit()
        print(f"Cleanup complete! Deleted {deleted_count} duplicate recipes.")

if __name__ == '__main__':
    remove_duplicates()
