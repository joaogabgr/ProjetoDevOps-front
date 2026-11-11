import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildSession } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { ParameterForm } from './ParameterForm';

describe('formato da chave do parâmetro (SCRUM-160 — RF3)', () => {
  async function submitWithKey(key: string) {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(<ParameterForm mode="create" submitLabel="Cadastrar" onSubmit={onSubmit} />, { session: buildSession() });
    await userEvent.type(screen.getByLabelText('Chave'), key);
    await userEvent.type(screen.getByLabelText('Nome'), 'Radiação Solar');
    await userEvent.type(screen.getByLabelText('Unidade'), 'W/m²');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    return onSubmit;
  }

  it.each(['Radiacao', '1radiacao', 'radiação', 'vento-vel'])('recusa a chave %s', async (key) => {
    const onSubmit = await submitWithKey(key);

    expect(screen.getByText(/comece com letra e use só minúsculas/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('aceita vento_vel', async () => {
    const onSubmit = await submitWithKey('vento_vel');

    expect(onSubmit).toHaveBeenCalled();
  });
});
