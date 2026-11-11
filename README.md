# Vigia das Águas – Front-end

Aplicação web do sistema de monitoramento comunitário e prevenção de enchentes do Instituto Vigia das Águas: painéis das estações, cadastros de estações, parâmetros, regras de alerta e usuários, relatórios e o painel público do nível do rio.

## Onde está cada coisa

| O quê | Onde |
|---|---|
| Requisitos, atas e processo do time | [Confluence – espaço Vigia das Águas](https://projetodevops.atlassian.net/wiki/spaces/VIGIA) |
| Histórias e subtarefas | [Jira – projeto SCRUM](https://projetodevops.atlassian.net/jira/software/projects/SCRUM/boards/1) (componente **Frontend**) |
| Back-end (API) | [ProjetoDevOps-back](https://github.com/joaogabgr/ProjetoDevOps-back) |

## Branch, commit e PR

O fluxo completo está no [Processo do PO](https://projetodevops.atlassian.net/wiki/spaces/VIGIA/pages/524289).

- **Branch:** uma por subtarefa `[FRONT]` do Jira, criada pelo botão *Create branch*. Ex.: `SCRUM-61-front-tela-de-estacoes`.
- **Commit:** `SCRUM-61 feat: descrição curta`. A chave faz o commit aparecer no painel *Development* da subtarefa.
- **PR:** título começando com a chave.
- **Release:** cada merge na `main` cria a release e a versão `front vX.Y.Z` no Jira.

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Melhoria de código sem mudar comportamento |
| `docs` | Documentação |
| `style` | Estilos e formatação |
| `test` | Testes |
