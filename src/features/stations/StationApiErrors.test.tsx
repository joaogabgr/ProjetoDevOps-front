import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../../api/client';
import { buildSession } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationForm } from './StationForm';

describe('erros da API no formulário de estação (SCRUM-154 — RF2 CA4)', () => {
  it('mostra o uid repetido ao lado do campo e mantém o que foi digitado', async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError(409, 'CONFLICT', 'Já existe uma estação com este identificador.', [
        { field: 'uuid', message: 'Já existe uma estação com este identificador.' },
      ]),
    );
    renderWithProviders(<StationForm mode="create" submitLabel="Cadastrar" onSubmit={onSubmit} />, {
      session: buildSession(),
    });

    await userEvent.type(screen.getByLabelText('Identificador da placa'), 'PCD-PAN-03');
    await userEvent.type(screen.getByLabelText('Nome'), 'Rio Miranda');
    await userEvent.type(screen.getByLabelText('Latitude'), '-20.24');
    await userEvent.type(screen.getByLabelText('Longitude'), '-56.37');
    await userEvent.type(screen.getByLabelText('Comunidade'), 'São Benedito');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    const input = screen.getByLabelText('Identificador da placa');
    expect(await screen.findByText('Já existe uma estação com este identificador.')).toHaveAttribute('id', 'uuid-error');
    expect(input).toHaveAttribute('aria-describedby', 'uuid-error');
    expect(input).toHaveValue('PCD-PAN-03');
    expect(screen.getByLabelText('Comunidade')).toHaveValue('São Benedito');
  });
});
