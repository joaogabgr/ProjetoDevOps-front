import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { StationCreatePage } from './features/stations/StationCreatePage';
import { StationEditPage } from './features/stations/StationEditPage';
import { StationsListPage } from './features/stations/StationsListPage';
import { AppLayout } from './layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="estacoes" element={<StationsListPage />} />
          <Route path="estacoes/nova" element={<StationCreatePage />} />
          <Route path="estacoes/:id/editar" element={<StationEditPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
