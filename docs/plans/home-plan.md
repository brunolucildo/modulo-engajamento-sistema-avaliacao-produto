# Plano: Home e listagem de produtos

## Objetivo

Tornar `/` a página pública de descoberta de produtos, com listagem paginada,
carregamento infinito e navegação para os detalhes de cada produto.

## Escopo

- Remover o redirecionamento atual da home para cadastro.
- Criar tabela e migration Supabase para produtos.
- Criar `GET /api/v1/products` com paginação.
- Criar o formulário/endpoint para inclusão manual de produtos, conforme
  contrato aprovado.
- Mostrar produtos com nome, imagem e descrição simples.
- Criar ou estabelecer o layout base e cabeçalho compartilhado.
- Vincular cada produto à futura tela de detalhes, usada pelo plano
  [Feedback](./feedback-plan.md).

Não inclui avaliações, tela de detalhes ou autenticação em si; essas partes
pertencem aos planos correspondentes.

## Plano de implementação

1. **Fechar o modelo de produto e a paginação**
   - Criar migration versionada em `supabase/migrations/`.
   - Definir `id` texto gerado com `nanoid` na camada de API, `name`,
     `description`, `created_at`, `updated_at` e `external_link`, alinhados à
     spec.
   - Incluir um campo para imagem, pois a listagem exige imagem e o endpoint de
     criação também a recebe; proposta: `image_url` texto.
   - Confirmar o uso do campo `score boolean` descrito na spec. Ele não representa
     naturalmente a média/nota de avaliações; não inferir ou atualizar seu
     significado sem decisão explícita.
   - Definir uma paginação estável e limitada, preferencialmente por cursor sobre
     `created_at` e `id`, e um tamanho máximo por página.
2. **Implementar acesso a dados e API pública de leitura**
   - Reutilizar `createSupabaseAdmin()` para acesso server-side.
   - Implementar `GET /api/v1/products`, com ordenação determinística,
     validação dos parâmetros, limite de página e retorno `200` também quando
     não houver resultados.
   - Usar uma resposta paginada explícita, por exemplo:

     ```json
     {
       "products": [],
       "nextCursor": null
     }
     ```
   - Retornar erros de forma clara e sem detalhes internos do Supabase.
3. **Implementar inclusão manual de produtos**
   - Criar endpoint `POST /api/v1/products` (a spec menciona `POST /products`,
     mas as demais APIs usam o prefixo `/api/v1`).
   - Validar `name`, `external_link` e imagem; gerar `id` na API e preencher
     timestamps no banco.
   - Não deixar uma rota de escrita administrativa irrestrita. Definir e
     documentar um mecanismo server-side para limitar essa operação antes de
     disponibilizá-la.
4. **Construir a Home**
   - Fazer `/` renderizar a listagem pública, mantendo uma primeira página
     utilizável sem JavaScript quando viável.
   - Implementar carregamento das próximas páginas ao aproximar do fim da lista,
     evitando requisições duplicadas e estados de carregamento infinitos.
   - Exibir estados de carregamento, lista vazia, erro recuperável e fim dos
     resultados.
   - Mostrar nome, imagem e descrição; o nome será um link acessível para
     `/products/[id]`.
5. **Criar o layout compartilhado da plataforma**
   - Extrair ou implementar cabeçalho e estrutura base sem quebrar as páginas de
     cadastro existentes.
   - Coordenar a integração com Sign-In: o plano Sign-In fornece o estado de
     sessão e o comportamento do cabeçalho autenticado/anônimo.
   - Atualizar metadados para refletir a plataforma, em vez da página de
     cadastro.
6. **Documentar configuração e uso**
   - Documentar migration, formato dos endpoints, paginação e a proteção do
     endpoint administrativo.

## Superfícies prováveis

- `src/app/page.tsx`
- Layout, cabeçalho e estilos compartilhados em `src/app/layout.tsx`,
  `src/app/globals.css` e novos componentes.
- `src/app/api/v1/products/route.ts`
- Componentes de listagem/cartão de produto e carregamento infinito.
- Helpers/schema em `src/lib/`.
- Nova migration em `supabase/migrations/`.
- `README.md` ou documentação técnica.

## Contratos de API propostos

### Leitura

`GET /api/v1/products` com cursor opcional.

- `200`: `{ "products": [...], "nextCursor": "..." | null }`
- A lista vazia é `{ "products": [], "nextCursor": null }`.
- Cada item expõe apenas os campos públicos necessários: `id`, `name`,
  `description`, `image_url` e `external_link`.

### Inclusão manual

`POST /api/v1/products` com `name`, `external_link` e `image_url`. A rota deve
ser protegida por um mecanismo administrativo server-side aprovado; não aceitar
credencial administrativa no código cliente.

## Verificações e critérios de aceite

- Migration cria a tabela e índices necessários sem alterar `accounts`.
- A API lista produtos de forma determinística e retorna lista vazia quando não
  há registros.
- A paginação não repete nem pula itens em condições normais de inserção.
- A Home apresenta nome, imagem e descrição e carrega páginas adicionais sem
  requisições duplicadas.
- Clique no nome leva ao identificador correto em `/products/[id]`.
- O endpoint de inclusão rejeita dados inválidos e escrita não autorizada.
- Executar typecheck, lint e build; testar paginação e estados da UI quando os
  padrões de teste disponíveis permitirem.

## Decisões/contratos a confirmar na aprovação

- A tabela solicitada não lista o campo de imagem, apesar de a Home e o POST
  exigirem imagem; o plano propõe `image_url`.
- A spec não define formato de paginação; o plano propõe cursor estável e
  limitado, em vez de offset/infinite loading sem limite.
- A spec não define como proteger a inclusão manual de produtos; a rota não deve
  ser publicada como escrita irrestrita.
- O tipo e o significado de `score boolean` não estão claros. O plano não o
  interpreta como média nem como avaliação.
- O caminho será `POST /api/v1/products` para manter consistência com o GET
  especificado e com as rotas atuais.
- A Home deve ser dona de `/` e do layout/cabeçalho compartilhado; Sign-In e
  Feedback devem integrar-se por contratos, sem editar esses mesmos pontos em
  paralelo.
