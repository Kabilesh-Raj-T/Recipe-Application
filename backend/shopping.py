from fractions import Fraction
from collections import defaultdict
from backend import units

DENSITIES = {
    'flour': Fraction(120, 236),
    'all-purpose flour': Fraction(120, 236),
    'whole wheat flour': Fraction(120, 236),
    'sugar': Fraction(200, 236),
    'granulated sugar': Fraction(200, 236),
    'brown sugar': Fraction(220, 236),
    'butter': Fraction(227, 236),
    'water': Fraction(1),
    'milk': Fraction(103, 100),
    'oil': Fraction(92, 100),
    'vegetable oil': Fraction(92, 100),
    'olive oil': Fraction(92, 100)
}

def build_list(recipes: list) -> list:
    buckets = defaultdict(lambda: defaultdict(list))
    
    # Step 1 & 2: Scale everything and bucket by (normalized_name, dimension)
    for recipe in recipes:
        factor = Fraction(recipe['target_servings'], recipe['servings'])
        
        for ing in recipe['ingredients']:
            scaled_q = ing['quantity'] * factor
            norm_name = ing['normalized_name']
            unit = ing['unit']
            name = ing['name']
            
            dim = units.get_dimension(unit)
            base_q = units.to_base(scaled_q, unit)
            
            buckets[norm_name][dim].append({
                'name': name,
                'base_quantity': base_q,
                'unit': unit
            })
            
    result = []
    
    # Step 3, 4 & 5: Group buckets, render, and pick headings
    for norm_name, dims in buckets.items():
        lines_out = []
        
        # Pick the most common raw `name` as display heading
        name_counts = defaultdict(int)
        for dim_items in dims.values():
            for item in dim_items:
                name_counts[item['name']] += 1
        best_heading = max(name_counts.items(), key=lambda x: x[1])[0]
        
        for dim, items in dims.items():
            total_base = sum((item['base_quantity'] for item in items), Fraction(0))
            
            # Pick the most common display unit among lines feeding this bucket
            unit_counts = defaultdict(int)
            for item in items:
                unit_counts[item['unit']] += 1
            best_unit = max(unit_counts.items(), key=lambda x: x[1])[0]
            
            # Render back to the chosen unit (rounding counts happens in render)
            rendered = units.render(total_base, best_unit, dim)
            
            # Auto-convert volumes to grams for known baking ingredients!
            if dim == 'VOLUME' and norm_name in DENSITIES:
                mass_g = total_base * DENSITIES[norm_name]
                mass_g_int = round(float(mass_g))
                rendered["unit"] += f" ({mass_g_int}g)"
                
            lines_out.append(rendered)
            
        mixed = len(lines_out) > 1
        result.append({
            "name": best_heading,
            "mixed": mixed,
            "lines": lines_out
        })
        
    result.sort(key=lambda x: x['name'].lower())
    return result
