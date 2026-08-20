import { Routes, Route, NavLink } from 'react-router-dom';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import NewRecipe from './pages/NewRecipe';
import Ingredients from './pages/Ingredients';
import ShoppingList from './pages/ShoppingList';

function App() {
  const getLinkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--cobalt)' : 'var(--ink)',
    textDecoration: 'none',
    fontWeight: '700',
    fontFamily: 'var(--font-heading)',
    fontSize: '1.2rem',
    borderBottom: isActive ? '3px solid var(--cobalt)' : '3px solid transparent',
    paddingBottom: '6px',
    transition: 'all 0.2s',
    opacity: isActive ? 1 : 0.7
  });

  return (
    <>
      <header className="no-print" style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: 'rgba(250, 250, 247, 0.85)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid var(--rule-light)' 
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px', display: 'flex', gap: '40px' }}>
          <NavLink to="/recipes" style={getLinkStyle}>Recipes</NavLink>
          <NavLink to="/ingredients" style={getLinkStyle}>Ingredients</NavLink>
          <NavLink to="/shopping-list" style={getLinkStyle}>Shopping List</NavLink>
        </div>
      </header>
      
      <main className="container">
        <Routes>
          <Route path="/" element={<Recipes />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/new" element={<NewRecipe />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
