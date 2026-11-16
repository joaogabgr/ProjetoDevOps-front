import { Link, useNavigate } from 'react-router-dom';
import { useFeedback } from '../../components/Feedback';
import { ParameterForm, type ParameterFormValues } from './ParameterForm';
import { parametersApi } from './parametersApi';

export function ParameterCreatePage() {
  const navigate = useNavigate();
  const feedback = useFeedback();

  async function create(values: ParameterFormValues) {
    await parametersApi.create({
      typeJson: values.typeJson.trim(),
      name: values.name.trim(),
      unit: values.unit.trim(),
      numberOfDecimalCases: Number(values.numberOfDecimalCases),
    });
    feedback.success('Parâmetro cadastrado.');
    navigate('/parametros');
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Novo parâmetro</h1>
        <Link to="/parametros">Voltar para a lista</Link>
      </header>
      <ParameterForm mode="create" submitLabel="Cadastrar parâmetro" onSubmit={create} />
    </section>
  );
}
