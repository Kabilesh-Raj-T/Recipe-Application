import re

def normalize(name: str) -> str:
    # Lowercase, strip, and collapse inner whitespace to single spaces
    s = re.sub(r'\s+', ' ', name.lower().strip())
    
    # Strip exactly one trailing "s" if the result is longer than 2 chars
    if s.endswith('s'):
        candidate = s[:-1]
        if len(candidate) > 2:
            return candidate
    return s
