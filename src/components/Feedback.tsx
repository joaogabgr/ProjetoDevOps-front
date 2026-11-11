import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Kind = 'success' | 'error';
interface Message {
  id: number;
  kind: Kind;
  text: string;
}

interface FeedbackApi {
  success(text: string): void;
  error(text: string): void;
}

const FeedbackContext = createContext<FeedbackApi | null>(null);
const DISMISS_AFTER_MS = 6000;
let nextId = 1;

/** Mensagens de sucesso e de erro depois de gravar algo (RNF1 R3). */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);

  const dismiss = useCallback((id: number) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  const push = useCallback(
    (kind: Kind, text: string) => {
      const id = nextId++;
      setMessages((current) => [...current, { id, kind, text }]);
      window.setTimeout(() => dismiss(id), DISMISS_AFTER_MS);
    },
    [dismiss],
  );

  const value = useMemo<FeedbackApi>(
    () => ({ success: (text) => push('success', text), error: (text) => push('error', text) }),
    [push],
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="feedback" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={`feedback__item feedback__item--${message.kind}`} role="status">
            <span>{message.text}</span>
            <button type="button" aria-label="Fechar mensagem" onClick={() => dismiss(message.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackApi {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback precisa de <FeedbackProvider>.');
  return context;
}
