CREATE TABLE recipes (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL,
    servings int NOT NULL CHECK (servings > 0),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE recipe_ingredients (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipe_id bigint REFERENCES recipes(id) ON DELETE CASCADE,
    name text NOT NULL,
    normalized_name text NOT NULL,
    quantity_num int NOT NULL CHECK (quantity_num > 0),
    quantity_den int NOT NULL DEFAULT 1 CHECK (quantity_den > 0),
    unit text NOT NULL,
    UNIQUE (recipe_id, normalized_name, unit)
);

CREATE TABLE steps (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipe_id bigint REFERENCES recipes(id) ON DELETE CASCADE,
    position int NOT NULL,
    text text NOT NULL,
    UNIQUE (recipe_id, position)
);

CREATE INDEX idx_recipe_ingredients_normalized_name ON recipe_ingredients(normalized_name);

-- Enable RLS (with no policies, making the anon key useless)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
