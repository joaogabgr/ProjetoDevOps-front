import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildSession } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { EMPTY_STATION, StationForm } from './StationForm';

vi.mock('./stationsApi', () => ({ stationsApi: { communities: vi.fn().mockResolvedValue([]) } }));

describe('identificador na edição (SCRUM-156 — RF2 R1)', () => {
  it('na edição o identificador não pode ser alterado', async () => {
    renderWithProviders(
      <StationForm mode="edit" initial={{ ...EMPTY_STATION, uuid: 'PCD-PAN-03' }} submitLabel="Salvar" onSubmit={vi.fn()} />,
      { session: buildSession() },
    );
    const uid = screen.getByLabelText('Identificador da placa');

    await userEvent.type(uid, 'X');

    expect(uid).toHaveAttribute('readonly');
    expect(uid).toHaveValue('PCD-PAN-03');
  });

  it('no cadastro o identificador é editável', () => {
    renderWithProviders(<StationForm mode="create" submitLabel="Cadastrar" onSubmit={vi.fn()} />, { session: buildSession() });

    expect(screen.getByLabelText('Identificador da placa')).not.toHaveAttribute('readonly');
  });
});
