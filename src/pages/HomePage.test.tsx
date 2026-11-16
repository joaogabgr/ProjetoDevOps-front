import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('mostra o nome do sistema', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: 'Vigia das Águas' })).toBeInTheDocument();
  });
});
