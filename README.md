# ProjetoDevOps - Front-end

Interface web da plataforma de monitoramento ambiental da Tecsus: visualização
dos dados das estações meteorológicas, dashboards interativos, gestão de
estações, parâmetros, alertas e usuários.

## Repositórios do projeto

| Repositório | Conteúdo |
|---|---|
| [ProjetoDevOps](https://github.com/joaogabgr/ProjetoDevOps) | Documentação, requisitos, Product Backlog e relatórios de sprint |
| [ProjetoDevOps-front](https://github.com/joaogabgr/ProjetoDevOps-front) | Este repositório: aplicação web |
| [ProjetoDevOps-back](https://github.com/joaogabgr/ProjetoDevOps-back) | API, processamento e persistência dos dados |

## Gestão

- Board: [Jira - projeto SCRUM](https://projetodevops.atlassian.net/jira/software/projects/SCRUM/boards/1)
- Requisitos e backlog completo: [README do repositório principal](https://github.com/joaogabgr/ProjetoDevOps#product-backlog)

## Convenção de branch e commit

Toda branch e todo commit devem citar a chave da issue do Jira (`SCRUM-00`).
É isso que faz o commit aparecer no painel *Development* da issue.

```bash
git checkout -b feature/SCRUM-36-dashboards-interativos
git commit -m "SCRUM-36 feat: grafico de temperatura por estacao"
```

O título do Pull Request também deve começar com a chave.

### Padrões de commit

| Prefixo | Uso |
|---------|-----|
| feat | Usado para criação de nova funcionalidade; |
| fix | Usado para corrigir algum problema no código e/ou funcionalidade (bugs); |
| refactor | Usado para refatoração de código sem alterar sua funcionalidade, apenas melhoria; |
| docs | Usado para atualizar documentações como o arquivo README.md; |
| style | Usado para atualizar estilos e arquivos de estilização; |
