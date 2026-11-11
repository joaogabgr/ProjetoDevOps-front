import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Providers } from '../components/Providers';

/** Renderiza com rotas e os serviços de tela, como na aplicação. */
export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Providers>{ui}</Providers>
    </MemoryRouter>,
  );
}
