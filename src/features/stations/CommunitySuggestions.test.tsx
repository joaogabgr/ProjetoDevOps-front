import { screen, waitFor } from '@testing-library/react';
import { buildSession } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StationForm } from './StationForm';
import { stationsApi } from './stationsApi';

vi.mock('./stationsApi', () => ({ stationsApi: { communities: vi.fn() } }));

describe('sugestões de comunidade (SCRUM-153 — RF2 CA3)', () => {
  it('CA3: oferece as comunidades já cadastradas no campo', async () => {
    vi.mocked(stationsApi.communities).mockResolvedValue(['Porto Esperança', 'São Benedito']);

    const { container } = renderWithProviders(<StationForm mode="create" submitLabel="Cadastrar" onSubmit={vi.fn()} />, {
      session: buildSession(),
    });

    expect(screen.getByLabelText('Comunidade')).toHaveAttribute('list', 'community-options');
    await waitFor(() => expect(container.querySelectorAll('#community-options option')).toHaveLength(2));
    expect(container.querySelector('#community-options option[value="São Benedito"]')).not.toBeNull();
  });

  it('sem sugestões o campo continua livre', async () => {
    vi.mocked(stationsApi.communities).mockRejectedValue(new Error('offline'));

    renderWithProviders(<StationForm mode="create" submitLabel="Cadastrar" onSubmit={vi.fn()} />, { session: buildSession() });

    await waitFor(() => expect(stationsApi.communities).toHaveBeenCalled());
    expect(screen.getByLabelText('Comunidade')).toBeEnabled();
  });
});
