import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { UserCreatePage } from './features/users/UserCreatePage';
import { UserEditPage } from './features/users/UserEditPage';
import { UsersListPage } from './features/users/UsersListPage';
import { ParameterCreatePage } from './features/parameters/ParameterCreatePage';
import { ParameterEditPage } from './features/parameters/ParameterEditPage';
import { ParametersListPage } from './features/parameters/ParametersListPage';
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
          <Route path="parametros" element={<ParametersListPage />} />
          <Route path="usuarios" element={<UsersListPage />} />
          <Route path="usuarios/novo" element={<UserCreatePage />} />
          <Route path="usuarios/:id/editar" element={<UserEditPage />} />
          <Route path="parametros/novo" element={<ParameterCreatePage />} />
          <Route path="parametros/:id/editar" element={<ParameterEditPage />} />
          <Route path="estacoes/nova" element={<StationCreatePage />} />
          <Route path="estacoes/:id/editar" element={<StationEditPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
