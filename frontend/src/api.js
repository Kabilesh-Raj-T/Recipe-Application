export async function getRecipes() {
    const res = await fetch('/api/recipes');
    if (!res.ok) throw new Error('Failed to fetch recipes');
    return res.json();
}

export async function getRecipe(id, servings) {
    const url = servings ? `/api/recipes/${id}?servings=${servings}` : `/api/recipes/${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch recipe');
    return res.json();
}

export async function createRecipe(data) {
    const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create recipe');
    }
    return res.json();
}

export async function deleteRecipe(id) {
    const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete recipe');
    return res.json();
}

export async function getShoppingList(selections) {
    const res = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selections })
    });
    if (!res.ok) throw new Error('Failed to generate shopping list');
    return res.json();
}

export async function getIngredients() {
    const res = await fetch('/api/ingredients');
    if (!res.ok) throw new Error('Failed to fetch ingredients');
    return res.json();
}
