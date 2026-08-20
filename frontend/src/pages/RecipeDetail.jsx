import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, deleteRecipe } from '../api';

export default function RecipeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [servings, setServings] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRecipe(id).then(r => {
            setRecipe(r);
            setServings(r.servings);
            setLoading(false);
        }).catch(console.error);
    }, [id]);

    useEffect(() => {
        if (recipe && servings !== recipe.servings) {
            getRecipe(id, servings).then(r => setRecipe(r)).catch(console.error);
        }
    }, [servings, id]);

    const handleDelete = async () => {
        if (window.confirm('Delete this recipe forever?')) {
            await deleteRecipe(id);
            navigate('/recipes');
        }
    };

    if (loading) return <div style={{ fontSize: '1.2rem', opacity: 0.7 }}>Loading recipe...</div>;
    if (!recipe) return <div>Recipe not found.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, marginBottom: '16px', fontSize: '3rem' }}>{recipe.name}</h1>
                    
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', background: 'white', padding: '8px 24px 8px 16px', borderRadius: '100px', border: '1px solid var(--rule-light)', boxShadow: 'var(--shadow-sm)' }}>
                        <strong style={{ fontFamily: 'var(--font-heading)', color: 'var(--ink)' }}>Servings</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button className="icon-btn" style={{ background: 'var(--rule-light)', color: 'var(--ink)' }} onClick={() => setServings(s => Math.max(1, s - 1))}>−</button>
                            <span className="qty" style={{ minWidth: '3ch', textAlign: 'center', fontSize: '1.25rem' }}>{servings}</span>
                            <button className="icon-btn" style={{ background: 'var(--rule-light)', color: 'var(--ink)' }} onClick={() => setServings(s => s + 1)}>+</button>
                        </div>
                    </div>
                </div>
                
                <button className="outline danger" onClick={handleDelete}>Delete</button>
            </div>

            <div className="card" style={{ marginBottom: '48px', padding: '40px' }}>
                <h2 style={{ marginBottom: '24px' }}>Ingredients</h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {recipe.ingredients.map((ing, i) => (
                        <li key={i} style={{ 
                            padding: '16px 0', 
                            borderBottom: i !== recipe.ingredients.length - 1 ? '1px solid var(--rule-light)' : 'none', 
                            display: 'flex', 
                            alignItems: 'baseline' 
                        }}>
                            <span className="qty" style={{ width: '90px', color: 'var(--cobalt)', fontSize: '1.15rem' }}>{ing.quantity}</span>
                            <span style={{ width: '90px', color: 'var(--ink)', opacity: 0.6, fontSize: '1.05rem' }}>{ing.unit}</span>
                            <strong style={{ flex: 1, fontSize: '1.15rem', color: 'var(--ink)' }}>{ing.name}</strong>
                        </li>
                    ))}
                </ul>
            </div>

            <h2 style={{ marginBottom: '24px', paddingLeft: '8px' }}>Instructions</h2>
            <div className="card" style={{ padding: '40px' }}>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {recipe.steps.map((step, i) => (
                        <li key={i} style={{ 
                            display: 'flex', 
                            gap: '24px', 
                            marginBottom: i !== recipe.steps.length - 1 ? '32px' : '0' 
                        }}>
                            <div style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                width: '36px', height: '36px', borderRadius: '50%', 
                                background: 'var(--cobalt)', color: 'white', 
                                fontWeight: '700', flexShrink: 0, fontFamily: 'var(--font-heading)', fontSize: '1.1rem'
                            }}>
                                {i + 1}
                            </div>
                            <div style={{ paddingTop: '4px', fontSize: '1.1rem', lineHeight: '1.7' }}>
                                {step}
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
