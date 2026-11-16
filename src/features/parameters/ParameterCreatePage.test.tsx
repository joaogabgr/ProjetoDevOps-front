import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { buildSession, buildTypeParameter } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { ParameterCreatePage } from './ParameterCreatePage';
import { parametersApi } from './parametersApi';

vi.mock('./parametersApi', () => ({ parametersApi: { create: vi.fn() } }));

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/parametros/novo" element={<ParameterCreatePage />} />
      <Route path="/parametros" element={<p>Lista de parâmetros</p>} />
    </Routes>,
    { route: '/parametros/novo', session: buildSession() },
  );
}

async function fill() {
  await userEvent.type(screen.getByLabelText('Chave'), 'radiacao');
  await userEvent.type(screen.getByLabelText('Nome'), 'Radiação Solar');
  await userEvent.type(screen.getByLabelText('Unidade'), 'W/m²');
}

describe('cadastro de parâmetro (SCRUM-66 — RF3)', () => {
  it('cadastra com 2 casas decimais por padrão e volta para a lista', async () => {
    vi.mocked(parametersApi.create).mockResolvedValue(buildTypeParameter());
    renderPage();

    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar parâmetro' }));

    expect(await screen.findByText('Lista de parâmetros')).toBeInTheDocument();
    expect(screen.getByText('Parâmetro cadastrado.')).toBeInTheDocument();
    expect(parametersApi.create).toHaveBeenCalledWith({
      typeJson: 'radiacao',
      name: 'Radiação Solar',
      unit: 'W/m²',
      numberOfDecimalCases: 2,
    });
  });

  it('mostra o erro de campo da API ao lado do campo', async () => {
    vi.mocked(parametersApi.create).mockRejectedValue(
      new ApiError(422, 'VALIDATION_ERROR', 'Dados inválidos na requisição.', [
        { field: 'typeJson', message: 'A chave deve começar com letra e ter só letras minúsculas, números e "_".' },
      ]),
    );
    renderPage();

    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar parâmetro' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('A chave deve começar com letra');
  });

  it('confere unidade e casas decimais antes de enviar', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText('Nome'), 'Radiação Solar');
    await userEvent.clear(screen.getByLabelText('Casas decimais'));
    await userEvent.type(screen.getByLabelText('Casas decimais'), '9');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar parâmetro' }));

    expect(screen.getByText('Informe a unidade.')).toBeInTheDocument();
    expect(screen.getByText('Use de 0 a 6 casas decimais.')).toBeInTheDocument();
    expect(parametersApi.create).not.toHaveBeenCalled();
  });
});
