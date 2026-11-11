import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { messageOf } from '../../api/client';
import type { User } from '../../api/types';
import { useFeedback } from '../../components/Feedback';
import { communityFor, UserForm, type UserFormValues } from './UserForm';
import { usersApi } from './usersApi';

export function UserEditPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const feedback = useFeedback();
  const fromList = (location.state as { user?: User } | null)?.user;
  const [user, setUser] = useState<User | null>(fromList?.id === id ? fromList : null);
  const [error, setError] = useState('');

  // Abrindo pelo endereço, sem vir da lista: procura o usuário na listagem.
  useEffect(() => {
    if (user) return;
    usersApi.list({ perPage: 100 }).then(
      (page) => {
        const found = page.data.find((item) => item.id === id);
        if (found) setUser(found);
        else setError('Usuário não encontrado.');
      },
      (caught) => setError(messageOf(caught)),
    );
  }, [id, user]);

  async function save(values: UserFormValues) {
    await usersApi.update(id, {
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role,
      community: communityFor(values),
    });
    feedback.success('Usuário atualizado.');
    navigate('/usuarios');
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Editar usuário</h1>
        <Link to="/usuarios">Voltar para a lista</Link>
      </header>
      {error && (
        <p className="page-error" role="alert">
          {error}
        </p>
      )}
      {!user && !error && <p>Carregando…</p>}
      {user && (
        <UserForm
          mode="edit"
          initial={{ name: user.name, email: user.email, cpf: '', password: '', role: user.role, community: user.community ?? '' }}
          submitLabel="Salvar alterações"
          onSubmit={save}
        />
      )}
    </section>
  );
}
