import { Link, useNavigate } from 'react-router-dom';
import { useFeedback } from '../../components/Feedback';
import { communityFor, UserForm, type UserFormValues } from './UserForm';
import { usersApi } from './usersApi';

export function UserCreatePage() {
  const navigate = useNavigate();
  const feedback = useFeedback();

  async function create(values: UserFormValues) {
    await usersApi.create({
      name: values.name.trim(),
      email: values.email.trim(),
      cpf: values.cpf,
      password: values.password,
      role: values.role,
      community: communityFor(values),
    });
    feedback.success('Usuário cadastrado.');
    navigate('/usuarios');
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Novo usuário</h1>
        <Link to="/usuarios">Voltar para a lista</Link>
      </header>
      <UserForm mode="create" submitLabel="Cadastrar usuário" onSubmit={create} />
    </section>
  );
}
