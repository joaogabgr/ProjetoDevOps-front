import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildSession } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { UserForm } from './UserForm';
import { isValidCpf } from './validators';

describe('validação do cadastro de usuário (SCRUM-176 — RF5)', () => {
  it('confere CPF, e-mail e senha antes de enviar', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<UserForm mode="create" submitLabel="Cadastrar" onSubmit={onSubmit} />, { session: buildSession() });

    await userEvent.type(screen.getByLabelText('Nome'), 'Maria das Dores');
    await userEvent.type(screen.getByLabelText('E-mail'), 'maria@');
    await userEvent.type(screen.getByLabelText('CPF'), '111.111.111-11');
    await userEvent.type(screen.getByLabelText('Senha'), 'curta');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(screen.getByText('Informe um CPF válido.')).toBeInTheDocument();
    expect(screen.getByText('A senha deve ter de 8 a 72 caracteres.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('dígitos verificadores do CPF', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('52998224726')).toBe(false);
    expect(isValidCpf('000.000.000-00')).toBe(false);
  });
});
