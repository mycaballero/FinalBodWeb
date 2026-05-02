import { Navigate, Route, Routes } from 'react-router-dom';
import { ProductList } from './pages/ProductList';
import { MovementForm } from './pages/MovementForm';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto w-full max-w-6xl p-6 md:p-10">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/movements/new" element={<MovementForm />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
