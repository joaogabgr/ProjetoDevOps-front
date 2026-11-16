import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildSession } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { UserForm } from './UserForm';

describe('comunidade só para agente comunitário (SCRUM-175 — RF5 R2)', () => {
  it('o campo aparece só para o agente', async () => {
    renderWithProviders(<UserForm mode="create" submitLabel="Cadastrar" onSubmit={vi.fn()} />, { session: buildSession() });

    expect(screen.queryByLabelText('Comunidade')).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Perfil'), 'COMMUNITY_AGENT');
    expect(screen.getByLabelText('Comunidade')).toBeInTheDocument();
  });

  it('CA1: agente sem comunidade não é enviado', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<UserForm mode="create" submitLabel="Cadastrar" onSubmit={onSubmit} />, { session: buildSession() });

    await userEvent.type(screen.getByLabelText('Nome'), 'Agente Sem Comunidade');
    await userEvent.selectOptions(screen.getByLabelText('Perfil'), 'COMMUNITY_AGENT');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(screen.getByText('Informe a comunidade do agente comunitário.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
