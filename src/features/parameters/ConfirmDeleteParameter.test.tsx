import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { buildSession, buildTypeParameter } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { ParametersListPage } from './ParametersListPage';
import { parametersApi } from './parametersApi';

vi.mock('./parametersApi', () => ({ parametersApi: { list: vi.fn(), remove: vi.fn() } }));

describe('confirmação antes de excluir parâmetro (SCRUM-165 — RNF1 R4)', () => {
  it('só exclui depois de confirmar', async () => {
    vi.mocked(parametersApi.list).mockResolvedValue([buildTypeParameter({ id: '3', typeJson: 'pressao', name: 'Pressão' })]);
    vi.mocked(parametersApi.remove).mockResolvedValue(undefined);
    renderWithProviders(
      <Routes>
        <Route path="/parametros" element={<ParametersListPage />} />
      </Routes>,
      { route: '/parametros', session: buildSession() },
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Excluir o parâmetro Pressão (pressao)?');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(parametersApi.remove).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Excluir' }).at(-1)!);
    expect(parametersApi.remove).toHaveBeenCalledWith('3');
  });
});
