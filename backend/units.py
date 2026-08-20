from fractions import Fraction
import math

# Minimal mapping to satisfy build_list requirements

DIMENSIONS = {
    'ml': 'VOLUME', 'cup': 'VOLUME', 'cups': 'VOLUME',
    'g': 'MASS', 'kg': 'MASS', 'oz': 'MASS',
    'piece': 'COUNT', 'pieces': 'COUNT'
}

CONVERSIONS = {
    'ml': Fraction(1), 'cup': Fraction(236, 1), 'cups': Fraction(236, 1),
    'g': Fraction(1), 'kg': Fraction(1000, 1), 'oz': Fraction(2835, 100),
    'piece': Fraction(1), 'pieces': Fraction(1)
}

def get_dimension(unit: str) -> str:
    return DIMENSIONS.get(unit.lower(), 'COUNT')

def to_base(quantity: Fraction, unit: str) -> Fraction:
    return quantity * CONVERSIONS.get(unit.lower(), Fraction(1))

def from_base(quantity: Fraction, unit: str) -> Fraction:
    return quantity / CONVERSIONS.get(unit.lower(), Fraction(1))

def render(quantity_base: Fraction, display_unit: str, dimension: str) -> dict:
    q = from_base(quantity_base, display_unit)
    
    # COUNT items get ceiling-rounded, but only when building the shopping list.
    if dimension == 'COUNT':
        q = Fraction(math.ceil(q))
    
    if q.denominator == 1:
        q_str = str(q.numerator)
    elif q.numerator > q.denominator:
        whole = q.numerator // q.denominator
        rem = q.numerator % q.denominator
        q_str = f"{whole} {rem}/{q.denominator}"
    else:
        q_str = f"{q.numerator}/{q.denominator}"
        
    return {
        "quantity": q_str,
        "unit": display_unit,
        "dimension": dimension
    }
