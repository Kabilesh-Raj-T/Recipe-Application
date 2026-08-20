import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecipes } from '../api';

export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getRecipes()
            .then(setRecipes)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <h1 style={{ margin: 0 }}>Saved Recipes</h1>
                <button onClick={() => navigate('/recipes/new')}>+ New Recipe</button>
            </div>
            
            {loading ? (
                <p style={{ opacity: 0.7 }}>Loading recipes...</p>
            ) : recipes.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <h2 style={{ color: 'var(--ink)' }}>No recipes yet</h2>
                    <p style={{ opacity: 0.7, marginBottom: '24px' }}>Get started by adding your first recipe to the box.</p>
                    <button onClick={() => navigate('/recipes/new')}>Create Recipe</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {recipes.map(r => (
                        <div 
                            key={r.id} 
                            className="card hoverable" 
                            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', padding: '24px' }} 
                            onClick={() => navigate(`/recipes/${r.id}`)}
                        >
                            <h2 style={{ marginBottom: 'auto', paddingBottom: '24px' }}>{r.name}</h2>
                            
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                                <span className="badge-pill">
                                    <span className="qty">{r.servings}</span> servings
                                </span>
                                <span className="badge-pill">
                                    <span className="qty">{r.ingredient_count}</span> ingredients
                                </span>
                                <span className="badge-pill">
                                    <span className="qty">{r.step_count}</span> steps
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
