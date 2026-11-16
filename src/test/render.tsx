import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { saveSession, type Session } from '../auth/session';
import { Providers } from '../components/Providers';

/** Renderiza com rotas e os serviços de tela, como na aplicação. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', session = null }: { route?: string; session?: Session | null } = {},
) {
  if (session) saveSession(session);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Providers>{ui}</Providers>
    </MemoryRouter>,
  );
}
