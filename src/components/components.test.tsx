import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderWithProviders } from '../test/render';
import { useConfirm } from './ConfirmDialog';
import { useFeedback } from './Feedback';
import { Field } from './Field';
import { Pagination } from './Pagination';

function FeedbackDemo() {
  const feedback = useFeedback();
  return (
    <>
      <button onClick={() => feedback.success('Estação cadastrada.')}>ok</button>
      <button onClick={() => feedback.error('Falhou.')}>erro</button>
    </>
  );
}

function ConfirmDemo() {
  const confirm = useConfirm();
  const [answer, setAnswer] = useState('');
  return (
    <>
      <button onClick={async () => setAnswer(String(await confirm({ title: 'Excluir?', message: 'Não dá para desfazer.', confirmLabel: 'Excluir', danger: true })))}>
        excluir
      </button>
      <output>{answer}</output>
    </>
  );
}

describe('componentes de tela (RNF1)', () => {
  it('mostra mensagem de sucesso e de erro e deixa fechar', async () => {
    renderWithProviders(<FeedbackDemo />);

    await userEvent.click(screen.getByText('ok'));
    await userEvent.click(screen.getByText('erro'));

    expect(screen.getByText('Estação cadastrada.')).toBeInTheDocument();
    expect(screen.getByText('Falhou.')).toBeInTheDocument();
    await userEvent.click(screen.getAllByLabelText('Fechar mensagem')[0]);
    expect(screen.queryByText('Estação cadastrada.')).not.toBeInTheDocument();
  });

  it('a mensagem some sozinha depois de alguns segundos', () => {
    vi.useFakeTimers();
    renderWithProviders(<FeedbackDemo />);

    act(() => screen.getByText('ok').click());
    act(() => vi.advanceTimersByTime(7000));

    expect(screen.queryByText('Estação cadastrada.')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('CA3: pede confirmação e devolve a resposta', async () => {
    renderWithProviders(<ConfirmDemo />);

    await userEvent.click(screen.getByText('excluir'));
    expect(screen.getByRole('dialog', { name: 'Excluir?' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('cancelar a confirmação devolve false', async () => {
    renderWithProviders(<ConfirmDemo />);

    await userEvent.click(screen.getByText('excluir'));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByText('false')).toBeInTheDocument();
  });

  it('o campo mostra o erro ao lado', () => {
    renderWithProviders(
      <Field id="uuid" label="Identificador" error="Já existe uma estação com este identificador.">
        <input id="uuid" />
      </Field>,
    );

    expect(screen.getByLabelText('Identificador')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Já existe uma estação com este identificador.');
  });

  it('a paginação avança e volta', async () => {
    const onChange = vi.fn();
    renderWithProviders(<Pagination page={2} totalPages={3} total={45} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));

    expect(onChange.mock.calls).toEqual([[3], [1]]);
    expect(screen.getByText(/Página 2 de 3/)).toBeInTheDocument();
  });
});
