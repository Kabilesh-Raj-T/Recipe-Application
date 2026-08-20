from sqlalchemy import Column, Integer, Integer, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Recipe(Base):
    __tablename__ = 'recipes'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    servings = Column(Integer, nullable=False)

    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    steps = relationship("Step", back_populates="recipe", cascade="all, delete-orphan")

class RecipeIngredient(Base):
    __tablename__ = 'recipe_ingredients'
    id = Column(Integer, primary_key=True, autoincrement=True)
    recipe_id = Column(Integer, ForeignKey('recipes.id', ondelete='CASCADE'), nullable=False)
    name = Column(Text, nullable=False)
    normalized_name = Column(Text, nullable=False)
    quantity_num = Column(Integer, nullable=False)
    quantity_den = Column(Integer, nullable=False, default=1)
    unit = Column(Text, nullable=False)

    __table_args__ = (
        UniqueConstraint('recipe_id', 'normalized_name', 'unit'),
    )

    recipe = relationship("Recipe", back_populates="ingredients")

class Step(Base):
    __tablename__ = 'steps'
    id = Column(Integer, primary_key=True, autoincrement=True)
    recipe_id = Column(Integer, ForeignKey('recipes.id', ondelete='CASCADE'), nullable=False)
    position = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)

    __table_args__ = (
        UniqueConstraint('recipe_id', 'position'),
    )

    recipe = relationship("Recipe", back_populates="steps")
