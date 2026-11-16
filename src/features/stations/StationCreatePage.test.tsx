import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { buildSession, buildStation, buildTypeParameter } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationCreatePage } from './StationCreatePage';
import { stationsApi } from './stationsApi';

vi.mock('./stationsApi', () => ({ stationsApi: { create: vi.fn() } }));
vi.mock('./useTypeParameters', () => ({
  useTypeParameters: () => ({ typeParameters: [buildTypeParameter({ id: '7', name: 'Nível do Rio', unit: 'cm' })], error: '' }),
}));

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/estacoes/nova" element={<StationCreatePage />} />
      <Route path="/estacoes" element={<p>Lista de estações</p>} />
    </Routes>,
    { route: '/estacoes/nova', session: buildSession() },
  );
}

async function fillValid() {
  await userEvent.type(screen.getByLabelText('Identificador da placa'), 'PCD-PAN-03');
  await userEvent.type(screen.getByLabelText('Nome'), 'Rio Miranda');
  await userEvent.type(screen.getByLabelText('Latitude'), '-20.24');
  await userEvent.type(screen.getByLabelText('Longitude'), '-56.37');
  await userEvent.type(screen.getByLabelText('Comunidade'), 'São Benedito');
  // Sem sensor o cadastro não é enviado (SCRUM-146).
  await userEvent.click(screen.getByLabelText('Nível do Rio (cm)'));
}

describe('cadastro de estação (SCRUM-152 — RF2)', () => {
  it('cadastra, mostra a mensagem e volta para a lista', async () => {
    vi.mocked(stationsApi.create).mockResolvedValue(buildStation());
    renderPage();

    await fillValid();
    await userEvent.selectOptions(screen.getByLabelText('Bioma'), 'PANTANAL');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar estação' }));

    expect(await screen.findByText('Lista de estações')).toBeInTheDocument();
    expect(screen.getByText('Estação cadastrada.')).toBeInTheDocument();
    expect(stationsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        uuid: 'PCD-PAN-03',
        community: 'São Benedito',
        timezone: 'America/Campo_Grande',
        communicationTimeoutMinutes: 60,
      }),
    );
  });

  it('confere as faixas antes de enviar', async () => {
    renderPage();

    await fillValid();
    await userEvent.clear(screen.getByLabelText('Latitude'));
    await userEvent.type(screen.getByLabelText('Latitude'), '-95');
    await userEvent.clear(screen.getByLabelText('Tempo limite sem comunicação (minutos)'));
    await userEvent.type(screen.getByLabelText('Tempo limite sem comunicação (minutos)'), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar estação' }));

    expect(screen.getByText('Latitude deve ser um número entre -90 e 90.')).toBeInTheDocument();
    expect(screen.getByText('O tempo limite deve ficar entre 15 e 1440 minutos.')).toBeInTheDocument();
    expect(stationsApi.create).not.toHaveBeenCalled();
  });

  it('mostra o erro da API e mantém o que foi digitado', async () => {
    vi.mocked(stationsApi.create).mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', 'Erro interno do servidor.'));
    renderPage();

    await fillValid();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar estação' }));

    expect(await screen.findByText('Erro interno do servidor.')).toBeInTheDocument();
    expect(screen.getByLabelText('Identificador da placa')).toHaveValue('PCD-PAN-03');
  });
});
