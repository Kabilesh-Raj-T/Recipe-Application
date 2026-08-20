import { useState, useEffect } from 'react';
import { getIngredients } from '../api';

export default function Ingredients() {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getIngredients()
            .then(setIngredients)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '16px' }}>Ingredients Catalog</h1>
            <p style={{ color: 'var(--ink)', opacity: 0.8, marginBottom: '40px', fontSize: '1.1rem', maxWidth: '700px' }}>
                Two ingredient lines merge when their normalized names match exactly. 
                The normalized key is exposed here alongside the display name so that this rule remains transparent.
            </p>

            {loading ? (
                <p style={{ opacity: 0.7 }}>Loading catalog...</p>
            ) : (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'white' }}>
                        <thead style={{ background: '#FAFAFA' }}>
                            <tr>
                                <th style={{ padding: '20px 24px', fontFamily: 'var(--font-heading)' }}>Display Name</th>
                                <th style={{ padding: '20px 24px', fontFamily: 'var(--font-heading)' }}>Normalized Key</th>
                                <th style={{ padding: '20px 24px', fontFamily: 'var(--font-heading)' }}>Usage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients.map((ing, i) => (
                                <tr key={ing.normalized_name} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF7' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', fontSize: '1.1rem' }}>{ing.name}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <code style={{ 
                                            fontFamily: 'var(--font-mono)', 
                                            color: 'var(--cobalt)',
                                            background: 'rgba(42, 76, 168, 0.05)',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem'
                                        }}>
                                            {ing.normalized_name}
                                        </code>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            <span className="qty">{ing.recipe_count}</span>
                                            <span style={{ opacity: 0.8, fontSize: '0.9em', fontWeight: 'normal' }}>
                                                recipe{ing.recipe_count !== 1 ? 's' : ''}
                                            </span>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {ingredients.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ padding: '48px', textAlign: 'center', color: 'var(--ink)', opacity: 0.6 }}>
                                        No ingredients logged yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
