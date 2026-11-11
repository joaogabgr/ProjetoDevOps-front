# Vigia das Águas – Front-end

Aplicação web do sistema de monitoramento comunitário e prevenção de enchentes do Instituto Vigia das Águas: painéis das estações, cadastros de estações, parâmetros, regras de alerta e usuários, relatórios e o painel público do nível do rio.

## Onde está cada coisa

| O quê | Onde |
|---|---|
| Requisitos, atas e processo do time | [Confluence – espaço Vigia das Águas](https://projetodevops.atlassian.net/wiki/spaces/VIGIA) |
| Histórias e subtarefas | [Jira – projeto SCRUM](https://projetodevops.atlassian.net/jira/software/projects/SCRUM/boards/1) (componente **Frontend**) |
| Back-end (API) | [ProjetoDevOps-back](https://github.com/joaogabgr/ProjetoDevOps-back) |

## Como rodar

Requer Node 20. A API (repositório back) precisa estar rodando na porta 3000.

```bash
npm ci
npm run dev      # http://localhost:5173, com /api repassado para a API
```

| Comando | O que faz |
|---|---|
| `npm test` | Testes (Vitest + Testing Library) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos |
| `npm run build` | Gera o `dist/` para publicar |

## Branch, commit e PR

O fluxo completo está no [Processo do PO](https://projetodevops.atlassian.net/wiki/spaces/VIGIA/pages/524289).

- **Branch:** uma por tarefa `[FRONT]` do Jira (componente Frontend), a partir da `develop`, com a chave e o requisito: `SCRUM-NN-rf-N-descricao`. Ex.: `SCRUM-61-rf-2-tela-de-lista-de-estacoes`.
- **Commit:** `SCRUM-61 feat: descrição curta`, ao menos dois por branch. A chave faz o commit aparecer no painel *Development* da tarefa.
- **PR:** para a `develop`, com o título igual ao nome da branch (o CI confere). No squash, a mensagem do commit sai com esse nome.
- **Regras:** `develop`, `homolog` e `main` só aceitam PR com o CI verde e a branch atualizada; a `main` também precisa de 1 aprovação.
- **Release:** cada merge na `main` cria a release e a versão `front vX.Y.Z` no Jira.

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Melhoria de código sem mudar comportamento |
| `docs` | Documentação |
| `style` | Estilos e formatação |
| `test` | Testes |
