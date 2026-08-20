from fractions import Fraction
from backend.shopping import build_list
from backend.normalize import normalize

def test_normalize():
    assert normalize("Large Eggs") == "large egg"
    assert normalize("  spaces   inside  ") == "spaces inside"
    assert normalize("bus") == "bus"  # "bu" is not > 2, so remains "bus"
    assert normalize("glasses") == "glasse"  # "glasse" is 6 chars, > 2
    assert normalize("flour") == "flour"

def test_shopping_list_same_ingredient_same_dimension():
    recipes = [
        {
            "name": "Recipe 1", "servings": 2, "target_servings": 4, 
            "ingredients": [
                {"name": "Flour", "normalized_name": "flour", "quantity": Fraction(1, 1), "unit": "cup"}
            ]
        },
        {
            "name": "Recipe 2", "servings": 1, "target_servings": 1, 
            "ingredients": [
                {"name": "flour", "normalized_name": "flour", "quantity": Fraction(1, 2), "unit": "cup"}
            ]
        }
    ]
    
    # Recipe 1: 1 * (4/2) = 2. Recipe 2: 1/2 * (1/1) = 1/2. Sum = 2 1/2.
    res = build_list(recipes)
    assert len(res) == 1
    assert res[0]["name"] == "Flour"  # Picked from the first or common (both are 1, but 'Flour' was first)
    assert not res[0]["mixed"]
    assert len(res[0]["lines"]) == 1
    assert res[0]["lines"][0]["quantity"] == "2 1/2"
    assert res[0]["lines"][0]["unit"] == "cup"
    assert res[0]["lines"][0]["dimension"] == "VOLUME"

def test_shopping_list_same_ingredient_different_dimension():
    recipes = [
        {
            "name": "Recipe 1", "servings": 1, "target_servings": 1, 
            "ingredients": [
                {"name": "Flour", "normalized_name": "flour", "quantity": Fraction(1, 1), "unit": "cup"}
            ]
        },
        {
            "name": "Recipe 2", "servings": 1, "target_servings": 1, 
            "ingredients": [
                {"name": "Flour", "normalized_name": "flour", "quantity": Fraction(200, 1), "unit": "g"}
            ]
        }
    ]
    
    res = build_list(recipes)
    assert len(res) == 1
    assert res[0]["name"] == "Flour"
    assert res[0]["mixed"] is True
    assert len(res[0]["lines"]) == 2
    
    dims = {line["dimension"] for line in res[0]["lines"]}
    assert dims == {"VOLUME", "MASS"}

def test_shopping_list_count_ceiling_rounded():
    recipes = [
        {
            "name": "Recipe 1", "servings": 2, "target_servings": 3, 
            "ingredients": [
                {"name": "Eggs", "normalized_name": "egg", "quantity": Fraction(1, 1), "unit": "piece"}
            ]
        }
    ]
    
    # 1 * (3/2) = 1.5 -> ceiling round -> 2
    res = build_list(recipes)
    assert len(res) == 1
    assert res[0]["lines"][0]["quantity"] == "2"
    assert res[0]["lines"][0]["dimension"] == "COUNT"


def _client():
    import os
    os.environ['DATABASE_URL'] = "sqlite:///local.db"
    from backend.app import app
    return app.test_client()

def test_recipe_detail_scales_converted_units():
    c = _client()
    # Cake is seeded at 4 servings with 2 cups of flour and 3 eggs.
    body = c.get('/api/recipes/1').get_json()
    by_name = {i["name"]: i for i in body["ingredients"]}
    assert by_name["Flour"]["quantity"] == "2"
    assert by_name["Flour"]["unit"] == "cups"
    assert by_name["Eggs"]["quantity"] == "3"

    doubled = c.get('/api/recipes/1?servings=8').get_json()
    by_name = {i["name"]: i for i in doubled["ingredients"]}
    assert doubled["servings"] == 8
    assert by_name["Flour"]["quantity"] == "4"
    assert by_name["Eggs"]["quantity"] == "6"

def test_recipe_detail_rejects_non_positive_servings():
    c = _client()
    assert c.get('/api/recipes/1?servings=0').status_code == 400
    assert c.get('/api/recipes/1?servings=-2').status_code == 400
    assert c.get('/api/recipes/1?servings=abc').status_code == 400

def test_create_recipe_rejects_bad_servings():
    c = _client()
    assert c.post('/api/recipes', json={"name": "X", "servings": 0}).status_code == 400
    assert c.post('/api/recipes', json={"name": "X", "servings": -1}).status_code == 400
    assert c.post('/api/recipes', json={"name": "X", "servings": "abc"}).status_code == 400

def test_shopping_list_skips_non_positive_servings():
    c = _client()
    res = c.post('/api/shopping-list', json={"selections": [{"recipe_id": 1, "servings": -4}]})
    assert res.status_code == 200
    assert res.get_json() == []
