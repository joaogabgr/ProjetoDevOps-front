import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { buildSession, buildTypeParameter } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { ParametersListPage } from './ParametersListPage';
import { parametersApi } from './parametersApi';

vi.mock('./parametersApi', () => ({ parametersApi: { list: vi.fn() } }));

describe('lista de parâmetros (SCRUM-70 — RF3 CA1)', () => {
  it('mostra os parâmetros das placas com chave, nome, unidade e casas', async () => {
    vi.mocked(parametersApi.list).mockResolvedValue([
      buildTypeParameter({ id: '6', typeJson: 'chuva', name: 'Índice Pluviométrico', unit: 'mm', numberOfDecimalCases: 2 }),
      buildTypeParameter({ id: '7', typeJson: 'nivel', name: 'Nível do Rio', unit: 'cm', numberOfDecimalCases: 1 }),
    ]);

    renderWithProviders(
      <Routes>
        <Route path="/parametros" element={<ParametersListPage />} />
      </Routes>,
      { route: '/parametros', session: buildSession() },
    );

    expect(await screen.findByText('Índice Pluviométrico')).toBeInTheDocument();
    expect(screen.getByText('chuva')).toBeInTheDocument();
    expect(screen.getByText('nivel')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Novo parâmetro' })).toHaveAttribute('href', '/parametros/novo');
  });
});
