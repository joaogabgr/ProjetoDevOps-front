import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  /** Ação que apaga dados: botão vermelho. */
  danger?: boolean;
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

interface Pending extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

/** Diálogo de confirmação antes de ações que apagam dados (RNF1 R4). */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<Confirm>(
    (options) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  const close = (confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(null);
  };

  useEffect(() => {
    if (pending) cancelRef.current?.focus();
  }, [pending]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div className="dialog-backdrop" onKeyDown={(event) => event.key === 'Escape' && close(false)}>
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <h2 id="confirm-title">{pending.title}</h2>
            <p>{pending.message}</p>
            <div className="dialog__actions">
              <button type="button" className="button button--secondary" ref={cancelRef} onClick={() => close(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className={pending.danger ? 'button button--danger' : 'button'}
                onClick={() => close(true)}
              >
                {pending.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): Confirm {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm precisa de <ConfirmProvider>.');
  return context;
}
