import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { buildSession, buildTypeParameter } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { ParametersListPage } from './ParametersListPage';
import { parametersApi } from './parametersApi';

vi.mock('./parametersApi', () => ({ parametersApi: { list: vi.fn(), remove: vi.fn() } }));

async function confirmDelete() {
  await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }));
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/parametros" element={<ParametersListPage />} />
    </Routes>,
    { route: '/parametros', session: buildSession() },
  );
}

describe('excluir parâmetro (SCRUM-72 — RF3 R5)', () => {
  it('exclui e recarrega a lista', async () => {
    vi.mocked(parametersApi.list).mockResolvedValue([buildTypeParameter({ id: '3', typeJson: 'pressao', name: 'Pressão' })]);
    vi.mocked(parametersApi.remove).mockResolvedValue(undefined);
    renderPage();

    await confirmDelete();

    expect(await screen.findByText('Parâmetro excluído.')).toBeInTheDocument();
    expect(parametersApi.remove).toHaveBeenCalledWith('3');
    expect(parametersApi.list).toHaveBeenCalledTimes(2);
  });

  it('CA4: mostra a recusa para parâmetro com leituras', async () => {
    vi.mocked(parametersApi.list).mockResolvedValue([buildTypeParameter({ id: '6', typeJson: 'chuva' })]);
    vi.mocked(parametersApi.remove).mockRejectedValue(new ApiError(409, 'CONFLICT', 'Parâmetro com leituras não pode ser excluído.'));
    renderPage();

    await confirmDelete();

    expect(await screen.findByText('Parâmetro com leituras não pode ser excluído.')).toBeInTheDocument();
  });
});
