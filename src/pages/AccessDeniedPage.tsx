import { Link } from 'react-router-dom';

/** Página mostrada quando a API responde 403 ao carregar uma tela (RF9 R6). */
export function AccessDeniedPage() {
  return (
    <section className="page">
      <h1>Acesso negado</h1>
      <p>Você não tem permissão para esta ação.</p>
      <Link to="/">Voltar ao início</Link>
    </section>
  );
}
