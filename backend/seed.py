import os
os.environ['DATABASE_URL'] = "sqlite:///local.db"

from backend.db import engine
from backend.models import Base, Recipe, RecipeIngredient, Step
from sqlalchemy.orm import Session
from backend.normalize import normalize

def run():
    print("Recreating database...")
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Recipe 1: Cake
        # Uses 'cups' of Flour, 'pieces' of Eggs
        r1 = Recipe(name="Cake", servings=4)
        session.add(r1)
        session.flush()
        
        ri1 = RecipeIngredient(recipe=r1, name="Flour", normalized_name=normalize("Flour"), quantity_num=2, quantity_den=1, unit="cups")
        ri2 = RecipeIngredient(recipe=r1, name="Eggs", normalized_name=normalize("Eggs"), quantity_num=3, quantity_den=1, unit="pieces")
        session.add_all([ri1, ri2])
        session.add(Step(recipe=r1, position=0, text="Mix flour and eggs"))
        
        # Recipe 2: Pancakes
        # Uses 'cup' of flour (should merge with Recipe 1's 'cups'), 'piece' of egg (should merge with Recipe 1's 'pieces')
        r2 = Recipe(name="Pancakes", servings=2)
        session.add(r2)
        session.flush()
        
        ri3 = RecipeIngredient(recipe=r2, name="flour", normalized_name=normalize("flour"), quantity_num=1, quantity_den=2, unit="cup")
        ri4 = RecipeIngredient(recipe=r2, name="egg", normalized_name=normalize("egg"), quantity_num=1, quantity_den=1, unit="piece")
        session.add_all([ri3, ri4])
        session.add(Step(recipe=r2, position=0, text="Make pancakes"))
        
        # Recipe 3: Bread
        # Uses 'g' (grams) of Flour. Since grams is MASS and cups is VOLUME, this will be separate.
        r3 = Recipe(name="Bread", servings=1)
        session.add(r3)
        session.flush()
        
        ri5 = RecipeIngredient(recipe=r3, name="Flour", normalized_name=normalize("Flour"), quantity_num=500, quantity_den=1, unit="g")
        session.add(ri5)
        session.add(Step(recipe=r3, position=0, text="Bake bread"))
        
        session.commit()
        print("Database seeded with 3 recipes.")

if __name__ == "__main__":
    run()
