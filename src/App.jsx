import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estoque from './pages/Estoque';
import Clientes from './pages/Clientes';
import Orcamentos from './pages/Orcamentos';
import Relatorios from './pages/Relatorios';
import AuditLog from './pages/AuditLog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Acessível a todos os usuários autenticados */}
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="orcamentos" element={<Orcamentos />} />

          {/* Exclusivo para administradores */}
          <Route path="estoque"   element={<AdminRoute><Estoque /></AdminRoute>} />
          <Route path="relatorios" element={<AdminRoute><Relatorios /></AdminRoute>} />
          <Route path="historico"  element={<AdminRoute><AuditLog /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
