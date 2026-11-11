import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { buildSession, buildTypeParameter } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { ParameterEditPage } from './ParameterEditPage';
import { parametersApi } from './parametersApi';

vi.mock('./parametersApi', () => ({ parametersApi: { list: vi.fn(), update: vi.fn() } }));

function renderPage(id = '7') {
  return renderWithProviders(
    <Routes>
      <Route path="/parametros/:id/editar" element={<ParameterEditPage />} />
      <Route path="/parametros" element={<p>Lista de parâmetros</p>} />
    </Routes>,
    { route: `/parametros/${id}/editar`, session: buildSession() },
  );
}

describe('edição de parâmetro (SCRUM-68 — RF3 R4)', () => {
  it('salva unidade e casas sem enviar a chave', async () => {
    vi.mocked(parametersApi.list).mockResolvedValue([buildTypeParameter({ id: '7', typeJson: 'nivel', unit: 'cm' })]);
    vi.mocked(parametersApi.update).mockResolvedValue(buildTypeParameter());
    renderPage();

    const unit = await screen.findByLabelText('Unidade');
    await userEvent.clear(unit);
    await userEvent.type(unit, 'm');
    await userEvent.clear(screen.getByLabelText('Casas decimais'));
    await userEvent.type(screen.getByLabelText('Casas decimais'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText('Lista de parâmetros')).toBeInTheDocument();
    expect(parametersApi.update).toHaveBeenCalledWith('7', { name: 'Nível do Rio', unit: 'm', numberOfDecimalCases: 2 });
  });

  it('avisa quando o parâmetro não existe', async () => {
    vi.mocked(parametersApi.list).mockResolvedValue([]);

    renderPage('99');

    expect(await screen.findByRole('alert')).toHaveTextContent('Parâmetro não encontrado.');
  });
});
