import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from fractions import Fraction
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.db import engine
from backend.models import Recipe, RecipeIngredient, Step
from backend.shopping import build_list
from backend.normalize import normalize
from backend import units
from flask import send_from_directory

app = Flask(__name__, static_folder='../frontend/dist/assets', static_url_path='/assets')
CORS(app)

def parse_servings(value):
    """Coerce a servings value to a strictly positive int, or return None."""
    try:
        n = int(value)
    except (TypeError, ValueError):
        return None
    return n if n > 0 else None

def parse_quantity(q_str):
    q_str = str(q_str).strip()
    try:
        parts = q_str.split()
        if len(parts) == 1:
            return Fraction(parts[0])
        elif len(parts) == 2:
            return Fraction(parts[0]) + Fraction(parts[1])
        else:
            raise ValueError("Too many parts in quantity")
    except Exception:
        raise ValueError(f"Invalid quantity: {q_str}")

@app.route('/api/recipes', methods=['GET'])
def list_recipes():
    with Session(engine) as session:
        recipes = session.query(Recipe).all()
        res = []
        for r in recipes:
            res.append({
                "id": r.id,
                "name": r.name,
                "servings": r.servings,
                "ingredient_count": len(r.ingredients),
                "step_count": len(r.steps)
            })
        return jsonify(res)

@app.route('/api/recipes', methods=['POST'])
def create_recipe():
    data = request.json
    if not data or 'name' not in data or 'servings' not in data:
        return jsonify({"error": "Missing name or servings"}), 400

    servings = parse_servings(data['servings'])
    if servings is None:
        return jsonify({"error": "servings must be a positive integer"}), 400

    with Session(engine) as session:
        r = Recipe(name=data['name'], servings=servings)
        session.add(r)
        
        try:
            for ing in data.get('ingredients', []):
                unit = ing.get('unit', '').lower()
                if unit not in units.DIMENSIONS:
                    return jsonify({"error": f"Unknown unit: {unit}"}), 400
                
                try:
                    q = parse_quantity(str(ing.get('quantity', '1')))
                    if q <= 0:
                        raise ValueError("Quantity must be strictly positive")
                except ValueError as e:
                    return jsonify({"error": str(e)}), 400
                    
                norm_name = normalize(ing['name'])
                
                ri = RecipeIngredient(
                    recipe=r,
                    name=ing['name'],
                    normalized_name=norm_name,
                    quantity_num=q.numerator,
                    quantity_den=q.denominator,
                    unit=unit
                )
                session.add(ri)
                
            for i, step_text in enumerate(data.get('steps', [])):
                s = Step(recipe=r, position=i, text=step_text)
                session.add(s)
                
            session.commit()
            return jsonify({"id": r.id}), 201
        except IntegrityError:
            session.rollback()
            return jsonify({"error": "Constraint violation (e.g. duplicate ingredient unit)"}), 400
        except Exception as e:
            session.rollback()
            return jsonify({"error": str(e)}), 500

@app.route('/api/recipes/<int:id>', methods=['GET'])
def get_recipe(id):
    raw_servings = request.args.get('servings')
    target_servings = None
    if raw_servings is not None:
        target_servings = parse_servings(raw_servings)
        if target_servings is None:
            return jsonify({"error": "servings must be a positive integer"}), 400

    with Session(engine) as session:
        r = session.query(Recipe).filter(Recipe.id == id).first()
        if not r:
            return jsonify({"error": "Not found"}), 404
        if r.servings < 1:
            return jsonify({"error": "Recipe has an invalid serving count"}), 500

        t_serv = target_servings if target_servings else r.servings
        factor = Fraction(t_serv, r.servings)
        
        ings = []
        for ing in r.ingredients:
            scaled = Fraction(ing.quantity_num, ing.quantity_den) * factor
            dim = units.get_dimension(ing.unit)
            # render() converts out of base units, so scale into base units first.
            rendered = units.render(units.to_base(scaled, ing.unit), ing.unit, dim)
            ings.append({
                "name": ing.name,
                "quantity": rendered["quantity"],
                "unit": ing.unit
            })
            
        steps_sorted = sorted(r.steps, key=lambda x: x.position)
        
        return jsonify({
            "id": r.id,
            "name": r.name,
            "servings": t_serv,
            "ingredients": ings,
            "steps": [s.text for s in steps_sorted]
        })

@app.route('/api/recipes/<int:id>', methods=['DELETE'])
def delete_recipe(id):
    with Session(engine) as session:
        r = session.query(Recipe).filter(Recipe.id == id).first()
        if not r:
            return jsonify({"error": "Not found"}), 404
        session.delete(r)
        session.commit()
        return jsonify({"status": "deleted"})

@app.route('/api/shopping-list', methods=['POST'])
def shopping_list():
    selections = request.json.get('selections', [])
    
    with Session(engine) as session:
        recipes_for_build = []
        for sel in selections:
            r_id = sel.get('recipe_id')
            t_serv = parse_servings(sel.get('servings'))
            if not r_id or not t_serv:
                continue
                
            r = session.query(Recipe).filter(Recipe.id == r_id).first()
            if not r or r.servings < 1:
                continue
                
            ing_list = []
            for ing in r.ingredients:
                ing_list.append({
                    "name": ing.name,
                    "normalized_name": ing.normalized_name,
                    "quantity": Fraction(ing.quantity_num, ing.quantity_den),
                    "unit": ing.unit
                })
                
            recipes_for_build.append({
                "name": r.name,
                "servings": r.servings,
                "target_servings": t_serv,
                "ingredients": ing_list
            })
            
        result = build_list(recipes_for_build)
        return jsonify(result)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path.startswith('api/'):
        return jsonify({"error": "Not found"}), 404
        
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
    file_path = os.path.join(dist_dir, path)
    if path and os.path.isfile(file_path):
        return send_from_directory(dist_dir, path)
        
    return send_from_directory(dist_dir, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
