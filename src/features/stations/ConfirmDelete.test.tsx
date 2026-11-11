import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { buildSession, buildStation } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationsListPage } from './StationsListPage';
import { stationsApi } from './stationsApi';

vi.mock('./stationsApi', () => ({ stationsApi: { list: vi.fn(), remove: vi.fn() } }));

function renderPage() {
  vi.mocked(stationsApi.list).mockResolvedValue({ data: [buildStation({ id: 's-1' })], meta: { total: 1, page: 1, perPage: 20, totalPages: 1 } });
  return renderWithProviders(
    <Routes>
        <Route path="/estacoes" element={<StationsListPage />} />
      </Routes>,
    { route: '/estacoes', session: buildSession() },
  );
}

describe('confirmação antes de excluir estação (SCRUM-159 — RNF1 R4)', () => {
  it('cancelar não exclui', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Excluir a estação PCD-PAN-03?');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(stationsApi.remove).not.toHaveBeenCalled();
  });

  it('confirmar exclui', async () => {
    vi.mocked(stationsApi.remove).mockResolvedValue(undefined);
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Excluir' }).at(-1)!);

    expect(stationsApi.remove).toHaveBeenCalledWith('s-1');
  });
});
