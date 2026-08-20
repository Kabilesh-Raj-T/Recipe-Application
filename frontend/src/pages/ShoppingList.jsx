import { useState, useEffect } from 'react';
import { getRecipes, getShoppingList } from '../api';

export default function ShoppingList() {
    const [recipes, setRecipes] = useState([]);
    const [selections, setSelections] = useState({});
    const [listResult, setListResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getRecipes().then(data => {
            setRecipes(data);
            const initial = {};
            data.forEach(r => {
                initial[r.id] = { selected: false, servings: r.servings };
            });
            setSelections(initial);
        }).catch(console.error);
    }, []);

    const handleSelect = (id, checked) => {
        setSelections(prev => ({ ...prev, [id]: { ...prev[id], selected: checked } }));
    };

    const handleServings = (id, val) => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed) || parsed < 1) return;
        setSelections(prev => ({ ...prev, [id]: { ...prev[id], servings: parsed } }));
    };

    const handleGenerate = async () => {
        setError(null);
        const payload = Object.entries(selections)
            .filter(([_, data]) => data.selected)
            .map(([id, data]) => ({ recipe_id: parseInt(id, 10), servings: data.servings }));
            
        if (payload.length === 0) {
            setListResult(null);
            return;
        }
        
        try {
            const result = await getShoppingList(payload);
            setListResult(result);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="no-print">
                <h1 style={{ marginBottom: '32px' }}>Shopping List</h1>
                {error && <div style={{ color: 'white', backgroundColor: 'var(--tomato)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>{error}</div>}
                
                <div className="card" style={{ marginBottom: '48px', padding: '32px' }}>
                    <h2 style={{ marginBottom: '24px' }}>Stack Recipes</h2>
                    {recipes.length === 0 ? (
                        <p style={{ color: 'var(--ink)', opacity: 0.7 }}>No recipes saved yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {recipes.map(r => (
                                <div key={r.id} style={{ 
                                    display: 'flex', alignItems: 'center', gap: '20px', 
                                    padding: '16px', borderRadius: 'var(--radius-sm)', 
                                    background: selections[r.id]?.selected ? 'rgba(42, 76, 168, 0.04)' : 'transparent',
                                    border: selections[r.id]?.selected ? '1px solid rgba(42, 76, 168, 0.2)' : '1px solid var(--rule-light)',
                                    transition: 'var(--transition)'
                                }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selections[r.id]?.selected || false} 
                                        onChange={(e) => handleSelect(r.id, e.target.checked)}
                                    />
                                    <strong style={{ flex: 1, fontSize: '1.15rem' }}>{r.name}</strong>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: selections[r.id]?.selected ? 1 : 0.4 }}>
                                        <label style={{ fontSize: '0.95rem', fontWeight: '600' }}>Servings:</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            className="qty"
                                            value={selections[r.id]?.servings || r.servings} 
                                            onChange={(e) => handleServings(r.id, e.target.value)}
                                            style={{ width: '80px', padding: '8px 12px' }}
                                            disabled={!selections[r.id]?.selected}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <button 
                        onClick={handleGenerate} 
                        style={{ marginTop: '32px', fontSize: '1.1rem', padding: '16px 32px', width: '100%' }} 
                        disabled={recipes.length === 0}
                    >
                        Generate List
                    </button>
                </div>
            </div>

            <div className="print-area">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid var(--rule)', paddingBottom: '16px', marginBottom: '32px' }}>
                    <h2 className="print-visible" style={{ margin: 0, fontSize: '2rem' }}>Your Run Sheet</h2>
                    {listResult && <button className="outline no-print" onClick={() => window.print()}>Print List</button>}
                </div>
                
                {!listResult ? (
                    <div className="no-print card" style={{ textAlign: 'center', padding: '64px 24px', background: 'transparent', borderStyle: 'dashed' }}>
                        <h3 style={{ opacity: 0.5 }}>Pick some recipes above to build your list.</h3>
                    </div>
                ) : (
                    <div>
                        {listResult.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{item.name}</h3>
                                    {item.mixed && (
                                        <span className="badge-mixed">Not combined — volume and weight</span>
                                    )}
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {item.lines.map((line, lidx) => (
                                        <li key={lidx} style={{ padding: '8px 16px', display: 'flex', alignItems: 'baseline', background: lidx % 2 === 0 ? 'white' : 'transparent', borderRadius: '4px' }}>
                                            <span className="qty" style={{ width: '100px', color: 'var(--cobalt)', fontSize: '1.2rem' }}>{line.quantity}</span>
                                            <span style={{ color: 'var(--ink)', fontSize: '1.1rem', opacity: 0.8 }}>{line.unit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        {listResult.length === 0 && (
                            <p style={{ fontStyle: 'italic', color: 'var(--ink)', opacity: 0.7 }}>No ingredients needed.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
