# Plano: Feedback e avaliações de produtos

## Objetivo

Permitir que qualquer pessoa consulte os detalhes e avaliações públicas de um
produto e que somente uma pessoa autenticada envie uma avaliação com nota de 1
a 5 e comentário.

## Escopo

- Página pública `/products/[id]`.
- Exibição dos dados do produto e das avaliações existentes.
- Nova tabela `products_feedbacks` e migration Supabase.
- Endpoint de leitura de avaliações e endpoint autenticado para criação.
- Formulário com validação de nota e comentário, condicionado à sessão.
- Mensagem/link de autenticação para visitantes anônimos.

Não inclui edição, exclusão, moderação, resposta a comentários, agregação de
nota do produto ou outros fluxos não definidos pela spec.

## Plano de implementação

1. **Definir modelo e validações**
   - Criar migration para `products_feedbacks`, com `id` gerado com `nanoid` na
     camada de API, `score` inteiro, `comment`, `created_at`, `created_by` e
     `product_id`.
   - Relacionar `created_by` a `accounts.id` e `product_id` a `products.id`,
     ambos IDs texto; definir comportamento de exclusão de acordo com o modelo
     do projeto.
   - Restringir `score` a inteiro entre 1 e 5 também no banco.
   - Definir limites de tamanho para comentário no schema e no banco/API,
     garantindo conteúdo não vazio após normalização.
   - Obter `created_by` exclusivamente da sessão validada no servidor, nunca do
     corpo enviado pelo navegador.
2. **Implementar leitura de detalhes e avaliações**
   - Obter produto por ID e retornar `404` se não existir.
   - Buscar avaliações vinculadas ao produto em ordenação estável, mais
     recentes primeiro.
   - Como a spec exige listar comentários mas não define API de leitura, propor
     `GET /api/v1/products/[id]/feedback`.
   - Permitir leitura sem autenticação.
3. **Implementar criação de avaliação**
   - Criar `POST /api/v1/products/[id]/feedback` com validação server-side.
   - Exigir sessão válida e associar a avaliação à conta autenticada.
   - Retornar `400` para payload inválido, `401` para pessoa não autenticada,
     `404` para produto inexistente e `201` para criação.
   - Não revelar dados internos nem aceitar `created_by` arbitrário.
4. **Construir a página de detalhes**
   - Renderizar detalhes do produto e avaliações existentes.
   - Para visitantes, mostrar um bloco explicando que é necessário entrar e um
     link para `/auth/sign-in`.
   - Para pessoas autenticadas, mostrar formulário de nota (1–5) e comentário.
   - Após sucesso, atualizar a lista sem recarregar toda a aplicação e informar
     o resultado; mostrar erro recuperável se a API falhar.
   - Preservar estados acessíveis de carregamento, produto inexistente, erro,
     lista vazia e envio.
5. **Integrar com Home e Sign-In**
   - Usar o mesmo formato de produto e rota de detalhe definidos no plano Home.
   - Consumir a sessão server-side definida no plano Sign-In.
   - A Home é proprietária da listagem, layout e cabeçalho; Feedback é
     proprietário da página de detalhe, tabela e rotas de avaliações.
6. **Documentar**
   - Descrever endpoints, validações, relação entre tabelas e migração.

## Superfícies prováveis

- `src/app/products/[id]/page.tsx`
- `src/app/api/v1/products/[id]/feedback/route.ts`
- Endpoint ou acesso a dados de detalhes do produto, se não houver contrato
  existente no trabalho da Home.
- Componentes de lista/formulário de avaliações.
- Schema Zod e helpers em `src/lib/`.
- Nova migration em `supabase/migrations/`.
- `README.md` ou documentação técnica.

## Contratos de API propostos

### Leitura pública

`GET /api/v1/products/[id]/feedback`

- `200`: `{ "feedbacks": [...] }`, inclusive quando a lista estiver vazia.
- `404`: produto não encontrado.

O carregamento dos detalhes do produto deverá usar um endpoint público de
detalhe definido em conjunto com o plano Home, ou acesso server-side equivalente.

### Criação autenticada

`POST /api/v1/products/[id]/feedback`

```json
{
  "score": 5,
  "comment": "Minha experiência com o produto."
}
```

- `201`: avaliação criada.
- `400`: nota/comentário inválidos.
- `401`: sessão ausente ou inválida.
- `404`: produto inexistente.

## Verificações e critérios de aceite

- Migration cria relações e impede notas fora do intervalo de 1 a 5.
- Detalhes e avaliações são visíveis sem login; produto inexistente resulta em
  `404`.
- Pessoa anônima vê o bloco de autenticação e não consegue criar avaliação,
  inclusive chamando a API diretamente.
- Pessoa autenticada consegue enviar nota/comentário válido e o autor é
  associado à sessão do servidor.
- Payload inválido é rejeitado pela API, mesmo que o cliente já valide.
- Nova avaliação aparece na lista após a criação.
- Executar typecheck, lint e build; validar regras de autorização, schema e
  respostas da API nos testes focados disponíveis.

## Decisões/contratos a confirmar na aprovação

- A spec não define endpoint para leitura de avaliações nem para carregar os
  detalhes do produto; o plano propõe GET público para avaliações e integração
  com um endpoint de detalhe a ser definido pela Home.
- A spec não define tamanho máximo do comentário; será necessário aprovar um
  limite para o schema/API e a migration.
- A spec não define exclusividade por pessoa/produto; o plano permite múltiplas
  avaliações da mesma pessoa para o mesmo produto, sem impor unicidade.
- A autenticação e a origem confiável de `created_by` dependem da sessão
  implementada pelo plano Sign-In.
- A relação `products_feedbacks.product_id` pressupõe a tabela e os IDs texto
  definidos pelo plano Home.
