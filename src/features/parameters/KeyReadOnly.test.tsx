import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildSession } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { ParameterForm } from './ParameterForm';

describe('chave na edição de parâmetro (SCRUM-163 — RF3 R3)', () => {
  it('a chave aparece e não pode ser alterada', async () => {
    renderWithProviders(
      <ParameterForm
        mode="edit"
        initial={{ typeJson: 'nivel', name: 'Nível do Rio', unit: 'cm', numberOfDecimalCases: '1' }}
        submitLabel="Salvar"
        onSubmit={vi.fn()}
      />,
      { session: buildSession() },
    );
    const key = screen.getByLabelText('Chave');

    await userEvent.type(key, '_rio');

    expect(key).toHaveAttribute('readonly');
    expect(key).toHaveValue('nivel');
  });
});
