import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { buildSession, buildTypeParameter } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationCreatePage } from './StationCreatePage';
import { stationsApi } from './stationsApi';

vi.mock('./stationsApi', () => ({ stationsApi: { create: vi.fn() } }));
vi.mock('./useTypeParameters', () => ({
  useTypeParameters: () => ({ typeParameters: [buildTypeParameter()], error: '' }),
}));

describe('estação sem sensor (SCRUM-146 — RF1 CA3)', () => {
  it('não envia e mostra a mensagem junto dos sensores', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/estacoes/nova" element={<StationCreatePage />} />
      </Routes>,
      { route: '/estacoes/nova', session: buildSession() },
    );

    await userEvent.type(screen.getByLabelText('Identificador da placa'), 'PCD-CER-02');
    await userEvent.type(screen.getByLabelText('Nome'), 'Córrego Fundo');
    await userEvent.type(screen.getByLabelText('Latitude'), '-15.9');
    await userEvent.type(screen.getByLabelText('Longitude'), '-48.1');
    await userEvent.type(screen.getByLabelText('Comunidade'), 'Vila Goiás');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar estação' }));

    expect(await screen.findByText('A estação precisa de ao menos um parâmetro.')).toBeInTheDocument();
    expect(stationsApi.create).not.toHaveBeenCalled();
  });
});
