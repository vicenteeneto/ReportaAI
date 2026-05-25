# Relatorio de melhorias e correcoes do reportaAI

Atualizado em: 25/05/2026

Este documento resume as principais melhorias e correcoes realizadas no projeto reportaAI ate o momento, para alinhamento com quem estiver trabalhando em paralelo no codigo.

## Contexto geral

O projeto foi mantido como uma aplicacao React/Vite SPA, sem migracao para Next.js e sem recriacao da estrutura existente. As alteracoes foram feitas sobre a base atual, preservando rotas, telas e funcionalidades ja existentes.

## Landing page

- Refinamento visual da landing para ficar mais comercial, humana e adequada a apresentacoes para prefeituras.
- Inclusao de imagens reais/geradas em vez de mockups em seco.
- Criacao e uso de assets locais em `src/assets/images/`.
- Hero atualizado com imagem de cidada usando celular em ambiente urbano.
- Secao "Do registro a solucao" criada/melhorada com cards visuais para cidadao, prefeitura e equipe de campo.
- Secao de mapa, indicadores e relatorios reforcada com mockup de gestao e imagem institucional.
- Gerada e aplicada a imagem `city-dashboard-operations.png` para representar monitoramento operacional e dashboard municipal.
- Ajustes no hero:
  - Remocao do selo "Plataforma govtech para atendimento urbano".
  - Remocao do botao "Ver demonstracao".
  - Reducao dos selos de recursos para melhor encaixe visual.
- Ajustes no footer:
  - Remocao dos links/botoes do rodape.
  - Remocao da frase "Tecnologia para aproximar cidadaos, prefeituras e solucoes."
  - Inclusao dos creditos: "© 2026 KNGindica. Todos os direitos reservados." e "Desenvolvido por KNGflow."
  - Remocao dos botoes redundantes do CTA final proximo ao rodape.

## Autenticacao e sessoes

- Corrigido redirecionamento antigo do login Google para usar `https://reportaai.kngflow.com`.
- Revisada a busca por URLs antigas dentro do projeto.
- Adicionado fluxo de recuperacao de senha na tela de login.
- Ajustadas mensagens amigaveis para erros de autenticacao:
  - Credenciais invalidas.
  - E-mail ja cadastrado.
  - Rate limit de e-mail.
  - Timeout de login/cadastro/recuperacao.
- Corrigido redirecionamento de cidadao de `/citizen/home` para `/citizen`.
- Melhorada hidratacao de sessao no `AppContext` para reduzir troca indevida de perfil e travamento em "Carregando reportaAI...".
- Adicionados timeouts em chamadas de sessao/perfil/dados para evitar loading infinito.

## Controle de acesso

- Protegida a area `/citizen/*` para aceitar apenas usuario com perfil `citizen`.
- Rotas administrativas revisadas por papel.
- Prefeito passou a ter acesso a visualizacao de chamados administrativos quando aplicavel.
- Criada rota `/admin/new` para permitir abertura de chamado dentro da area administrativa, sem redirecionar usuarios administrativos para o portal cidadao.

## Painel administrativo

- Botao "Novo Chamado" no painel administrativo passou a abrir `/admin/new`.
- Apos criar chamado via fluxo administrativo, os botoes de sucesso retornam para:
  - `/admin/tickets`, quando usado pelo admin.
  - `/admin/dashboard`, no botao de retorno administrativo.
- Botao "Filtros" em Gestao de Chamados passou a abrir filtros reais:
  - Prioridade.
  - Bairro.
- KPIs do dashboard foram ligados a filtros de listagem de chamados em rodada anterior.
- Botao de sair foi ajustado para limpar estado local e redirecionar corretamente para login.

## Modal de chamados administrativos

- Corrigida abertura de imagens dos chamados no painel administrativo.
- Galeria de evidencias do cidadao suporta multiplas imagens.
- Ajustado upload de evidencia de resolucao quando status e alterado para resolvido.
- Corrigido erro em que o status era alterado, mas o sistema mostrava mensagem de falha.
- Atualizacao de status agora tenta formatos diferentes de coluna no Supabase:
  - `resolvedPhotoUrl` / `updatedAt`.
  - `resolved_photo_url` / `updated_at`.
- Historico de tramitacao agora tenta formatos diferentes:
  - `ticketId`, `userId`, `newStatus`, `createdAt`.
  - `ticket_id`, `user_id`, `new_status`, `created_at`.
- Historico foi normalizado para exibir:
  - Data e hora.
  - Responsavel pela alteracao, quando disponivel.
  - Status anterior e novo status.
  - Observacoes/comentarios digitados pelo administrador.

## Portal do cidadao

- Corrigida abertura de imagens em detalhes de chamados do cidadao.
- Ajustes no fluxo de novo chamado para funcionar tanto no portal cidadao quanto no contexto administrativo.
- Melhorias em mensagens de upload/localizacao e tratamento de erro em imagens.

## Mapa e relatorios

- Ajustados pins visuais na landing para ficarem na posicao correta.
- Botao de filtros avancados no mapa administrativo passou por correcoes anteriores.
- Painel executivo recebeu grafico por bairro em rodada anterior.
- Relatorios PDF e exportacoes foram preservados sem alteracoes estruturais de deploy.

## Arquivos auxiliares removidos

Foram identificados na raiz do projeto varios arquivos criados apenas para ajustes manuais de Supabase, seeds, testes de conexao e operacoes temporarias. Eles nao faziam parte da aplicacao React/Vite em runtime.

Arquivos removidos:

- Scripts SQL soltos de schema, RLS, storage, seeds e correcoes.
- Scripts JS soltos de criacao/teste/check de tabelas e usuarios.
- Arquivos temporarios `temp_*.txt` usados como apoio de edicao.

O codigo real da aplicacao permanece em:

- `src/`
- `public/`
- `index.html`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`
- `vercel.json`

## Validacoes realizadas

Em diferentes rodadas foram executados:

- `npm run lint`
- `npm run build`

Ambos passaram nas validacoes mais recentes antes dos commits enviados.

## Observacoes para continuidade

- Evitar recriar o projeto ou mudar o framework.
- Manter SPA em React/Vite.
- Manter as variaveis Supabase via `.env.local` e `.env.example`.
- Evitar reintroduzir scripts SQL temporarios na raiz; se necessario, criar uma pasta dedicada e documentada, como `docs/supabase/`, apenas se esses arquivos passarem a ser parte oficial do projeto.
- Antes de alterar autenticacao, conferir `src/context/AppContext.tsx` e `src/pages/auth/LoginPage.tsx`, pois ja possuem tratamento de sessao, timeout e mensagens amigaveis.
- Antes de alterar chamados administrativos, conferir `src/components/admin/AdminTicketDetailsModal.tsx`, pois ele contem fallbacks para diferentes formatos de colunas no Supabase.
