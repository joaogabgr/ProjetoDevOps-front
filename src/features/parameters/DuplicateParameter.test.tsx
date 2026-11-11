import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../../api/client';
import { buildSession } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { ParameterForm } from './ParameterForm';

async function submitRejectedWith(message: string) {
  const onSubmit = vi.fn().mockRejectedValue(new ApiError(409, 'CONFLICT', message));
  renderWithProviders(<ParameterForm mode="create" submitLabel="Cadastrar" onSubmit={onSubmit} />, { session: buildSession() });
  await userEvent.type(screen.getByLabelText('Chave'), 'chuva');
  await userEvent.type(screen.getByLabelText('Nome'), 'Chuva');
  await userEvent.type(screen.getByLabelText('Unidade'), 'mm');
  await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
}

describe('chave ou nome repetido (SCRUM-161 — RF3 CA2)', () => {
  it('CA2: chave repetida aparece no campo Chave', async () => {
    await submitRejectedWith('Já existe um parâmetro com a chave "chuva".');

    expect(await screen.findByText('Já existe um parâmetro com a chave "chuva".')).toHaveAttribute('id', 'typeJson-error');
  });

  it('nome repetido aparece no campo Nome', async () => {
    await submitRejectedWith('Já existe um parâmetro com o nome "Chuva".');

    expect(await screen.findByText('Já existe um parâmetro com o nome "Chuva".')).toHaveAttribute('id', 'name-error');
  });
});
