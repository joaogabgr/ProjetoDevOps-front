import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { buildSession, buildStation } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationEditPage } from './StationEditPage';
import { stationsApi } from './stationsApi';

vi.mock('./stationsApi', () => ({ stationsApi: { get: vi.fn(), update: vi.fn() } }));

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/estacoes/:id/editar" element={<StationEditPage />} />
      <Route path="/estacoes" element={<p>Lista de estações</p>} />
    </Routes>,
    { route: '/estacoes/s-1/editar', session: buildSession() },
  );
}

describe('edição de estação (SCRUM-58 — RF2)', () => {
  it('carrega a estação, salva as mudanças sem enviar o identificador e volta para a lista', async () => {
    vi.mocked(stationsApi.get).mockResolvedValue(buildStation({ id: 's-1', name: 'Rio Miranda', communicationTimeoutMinutes: 60 }));
    vi.mocked(stationsApi.update).mockResolvedValue(buildStation());
    renderPage();

    const name = await screen.findByLabelText('Nome');
    expect(name).toHaveValue('Rio Miranda');
    await userEvent.clear(name);
    await userEvent.type(name, 'Rio Miranda – Ponte');
    await userEvent.clear(screen.getByLabelText('Tempo limite sem comunicação (minutos)'));
    await userEvent.type(screen.getByLabelText('Tempo limite sem comunicação (minutos)'), '90');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText('Lista de estações')).toBeInTheDocument();
    expect(screen.getByText('Estação atualizada.')).toBeInTheDocument();
    const [id, body] = vi.mocked(stationsApi.update).mock.calls[0];
    expect(id).toBe('s-1');
    expect(body).toMatchObject({ name: 'Rio Miranda – Ponte', communicationTimeoutMinutes: 90 });
    expect(body).not.toHaveProperty('uuid');
  });

  it('mostra o erro quando a estação não existe', async () => {
    vi.mocked(stationsApi.get).mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'Estação não encontrado(a).'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Estação não encontrado(a).');
  });
});
