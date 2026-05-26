# Continuidade Codex - reportaAI

Atualizado em: 26/05/2026

Este arquivo existe para permitir retomada segura do trabalho caso a conversa seja interrompida, compactada ou fique sem creditos/tokens.

## Estado atual

- Projeto React/Vite SPA.
- Repositorio: `vicenteeneto/ReportaAI`.
- Branch usada: `main`.
- Deploy esperado via Vercel apos `git push`.
- Supabase usado como autenticacao, banco e storage.

## Melhorias recentes implementadas

- Historico de chamados centralizado em `src/lib/ticketHistory.ts`.
- Admin e cidadao leem o historico real de `ticket_history`.
- Atualizacoes de status passam a tentar gravar historico em formatos compativeis com schemas diferentes.
- Corrigida mensagem contraditoria no modal admin: sucesso so aparece se o historico foi gravado.
- Presenca online escopada por cidade para admins municipais e global para superadmin.
- Dashboard/listagem passaram a ignorar chamados encerrados ao calcular fila ativa.
- Mapas admin/cidadao filtram coordenadas invalidas antes de renderizar marcadores.
- Relatorios PDF nao geram percentual invalido quando nao ha chamados nos filtros.
- Criado `src/lib/sla.ts` para padronizar prazos operacionais por prioridade.
- Dashboard admin, painel executivo, gestao de chamados e mapa admin passaram a exibir/filtrar SLA.

## Regras de SLA atuais

As regras estao em `src/lib/sla.ts`:

- `urgent`: 1 dia.
- `high`: 3 dias.
- `medium`: 7 dias.
- `low`: 15 dias.

Se o ticket tiver `dueDate`, essa data prevalece. Caso contrario, o prazo e calculado a partir de `createdAt`.

## Proximos passos recomendados

1. Padronizar oficialmente o schema Supabase.
   - Principalmente `ticket_history`.
   - Ideal: `ticket_id`, `user_id`, `action`, `old_status`, `new_status`, `comment`, `created_at`, `visibility`, `department_id`.

2. Remover fallbacks depois que o schema estiver estabilizado.
   - `ticketHistory.ts` hoje tenta varios formatos para nao quebrar em producao.

3. Criar Edge Function para usuarios administrativos.
   - Evitar `supabase.auth.signUp` no client para superadmin criar usuarios.
   - Usar `auth.admin.createUser` no backend.

4. Implementar permissoes fortes por perfil.
   - Prefeito: leitura ampla.
   - Secretario/coordenador: sua secretaria.
   - Triagem: fila inicial.
   - Campo: chamados atribuidos.
   - Superadmin: global.
   - Reforcar tambem no Supabase/RLS, nao apenas no front.

5. Criar atribuicao de equipe/responsavel.
   - O botao "Atribuir Equipe" no mapa/admin ainda nao executa logica real.

6. Criar notificacoes.
   - Inicialmente por e-mail.
   - Futuramente WhatsApp/push.

## Validacao esperada antes de cada push

Executar:

```bash
npm run lint
npm run build
```

Depois:

```bash
git status --short
git add ...
git commit -m "mensagem"
git push
```
