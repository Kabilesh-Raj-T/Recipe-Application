import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecipe } from '../api';

export default function NewRecipe() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [servings, setServings] = useState(4);
    const [ingredients, setIngredients] = useState([{ name: '', quantity: '1', unit: 'cup' }]);
    const [steps, setSteps] = useState(['']);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const data = {
                name,
                servings: parseInt(servings, 10),
                ingredients: ingredients.filter(i => i.name.trim()),
                steps: steps.filter(s => s.trim())
            };
            await createRecipe(data);
            navigate('/recipes');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '32px' }}>Write a Recipe</h1>
            
            {error && (
                <div style={{ color: 'white', backgroundColor: 'var(--tomato)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontWeight: '500' }}>
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="card" style={{ marginBottom: '32px' }}>
                    <div className="form-row">
                        <label className="form-label">Recipe Name</label>
                        <input required placeholder="e.g. Grandma's Apple Pie" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="form-row" style={{ marginTop: '24px' }}>
                        <label className="form-label">Base Servings</label>
                        <input type="number" min="1" required className="qty" value={servings} onChange={e => setServings(e.target.value)} style={{ width: '120px' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', marginTop: '48px' }}>
                    <h2 style={{ margin: 0 }}>Ingredients</h2>
                </div>
                
                <div className="card" style={{ marginBottom: '32px' }}>
                    {ingredients.map((ing, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                            <input 
                                placeholder="Qty (1 1/2)" 
                                className="qty" 
                                value={ing.quantity} 
                                onChange={e => {
                                    const newIngs = [...ingredients];
                                    newIngs[i].quantity = e.target.value;
                                    setIngredients(newIngs);
                                }} 
                                style={{ width: '100px' }} 
                            />
                            <select 
                                value={ing.unit} 
                                onChange={e => {
                                    const newIngs = [...ingredients];
                                    newIngs[i].unit = e.target.value;
                                    setIngredients(newIngs);
                                }}
                                style={{ width: '110px' }}
                            >
                                <option value="ml">ml</option>
                                <option value="tbsp">tbsp</option>
                                <option value="cup">cup</option>
                                <option value="cups">cups</option>
                                <option value="g">g</option>
                                <option value="kg">kg</option>
                                <option value="oz">oz</option>
                                <option value="piece">piece</option>
                                <option value="pieces">pieces</option>
                            </select>
                            <input 
                                placeholder="Ingredient name" 
                                value={ing.name} 
                                onChange={e => {
                                    const newIngs = [...ingredients];
                                    newIngs[i].name = e.target.value;
                                    setIngredients(newIngs);
                                }} 
                                style={{ flex: 1 }} 
                            />
                            <button 
                                type="button" 
                                className="icon-btn danger" 
                                onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}
                                title="Remove ingredient"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button type="button" className="outline" style={{ marginTop: '8px' }} onClick={() => setIngredients([...ingredients, { name: '', quantity: '1', unit: 'cup' }])}>
                        + Add ingredient
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', marginTop: '48px' }}>
                    <h2 style={{ margin: 0 }}>Instructions</h2>
                </div>
                
                <div className="card" style={{ marginBottom: '40px' }}>
                    {steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                width: '32px', height: '32px', borderRadius: '50%', 
                                background: 'rgba(42, 76, 168, 0.1)', color: 'var(--cobalt)', 
                                fontWeight: '700', flexShrink: 0, marginTop: '8px'
                            }}>
                                {i + 1}
                            </div>
                            <textarea 
                                placeholder="Describe this step..." 
                                value={step} 
                                onChange={e => {
                                    const newSteps = [...steps];
                                    newSteps[i] = e.target.value;
                                    setSteps(newSteps);
                                }} 
                                style={{ flex: 1, minHeight: '80px', resize: 'vertical' }} 
                            />
                            <button 
                                type="button" 
                                className="icon-btn danger" 
                                onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
                                title="Remove step"
                                style={{ alignSelf: 'flex-start', marginTop: '8px' }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button type="button" className="outline" onClick={() => setSteps([...steps, ''])}>
                        + Add step
                    </button>
                </div>

                <button type="submit" style={{ width: '100%', fontSize: '1.25rem', padding: '16px' }}>
                    Save Recipe
                </button>
            </form>
        </div>
    );
}
