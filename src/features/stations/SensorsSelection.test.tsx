import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { buildSession, buildStation, buildTypeParameter } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationCreatePage } from './StationCreatePage';
import { stationsApi } from './stationsApi';

vi.mock('./stationsApi', () => ({ stationsApi: { create: vi.fn() } }));
vi.mock('./useTypeParameters', () => ({
  useTypeParameters: () => ({
    typeParameters: [
      buildTypeParameter({ id: '1', typeJson: 'temp', name: 'Temperatura', unit: '°C' }),
      buildTypeParameter({ id: '6', typeJson: 'chuva', name: 'Índice Pluviométrico', unit: 'mm' }),
      buildTypeParameter({ id: '7', typeJson: 'nivel', name: 'Nível do Rio', unit: 'cm' }),
    ],
    error: '',
  }),
}));

describe('seleção de sensores (SCRUM-55 — RF1 R1)', () => {
  it('envia só os sensores escolhidos', async () => {
    vi.mocked(stationsApi.create).mockResolvedValue(buildStation());
    renderWithProviders(
      <Routes>
        <Route path="/estacoes/nova" element={<StationCreatePage />} />
        <Route path="/estacoes" element={<p>Lista</p>} />
      </Routes>,
      { route: '/estacoes/nova', session: buildSession() },
    );

    await userEvent.type(screen.getByLabelText('Identificador da placa'), 'PCD-CER-02');
    await userEvent.type(screen.getByLabelText('Nome'), 'Córrego Fundo');
    await userEvent.type(screen.getByLabelText('Latitude'), '-15.9');
    await userEvent.type(screen.getByLabelText('Longitude'), '-48.1');
    await userEvent.type(screen.getByLabelText('Comunidade'), 'Vila Goiás');
    await userEvent.click(screen.getByLabelText('Índice Pluviométrico (mm)'));
    await userEvent.click(screen.getByLabelText('Temperatura (°C)'));
    await userEvent.click(screen.getByLabelText('Nível do Rio (cm)'));
    await userEvent.click(screen.getByLabelText('Nível do Rio (cm)'));
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar estação' }));

    expect(await screen.findByText('Lista')).toBeInTheDocument();
    expect(stationsApi.create).toHaveBeenCalledWith(expect.objectContaining({ typeParameterIds: ['6', '1'] }));
  });
});
