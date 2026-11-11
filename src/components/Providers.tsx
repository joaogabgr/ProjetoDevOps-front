import type { ReactNode } from 'react';
import { AuthProvider } from '../auth/AuthContext';
import { ConfirmProvider } from './ConfirmDialog';
import { FeedbackProvider } from './Feedback';

/** Serviços de tela usados por todas as páginas. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FeedbackProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </FeedbackProvider>
    </AuthProvider>
  );
}
