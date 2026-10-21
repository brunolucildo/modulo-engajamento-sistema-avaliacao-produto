# Produtos

## Listar produtos

`GET /api/v1/products` retorna produtos públicos em páginas de 12 itens,
ordenados por `created_at` e `id` em ordem decrescente. A resposta tem o formato
`{ "products": [...], "nextCursor": "..." }`; `nextCursor` será `null` quando
não houver outra página. Envie o cursor retornado como parâmetro `cursor` na
próxima requisição. Uma coleção vazia retorna `200` com `products: []` e
`nextCursor: null`.

Cada produto expõe `id`, `name`, `description`, `image_url` e `external_link`.

## Criar produto

`POST /api/v1/products` é uma operação administrativa protegida pelo segredo
server-side `PRODUCTS_ADMIN_API_KEY`. Envie o valor no cabeçalho
`Authorization: Bearer <chave>`. A chave não deve ser incluída em aplicações de
navegador ou variáveis `NEXT_PUBLIC_*`.

O JSON aceita `name`, `external_link`, `image_url` e `description` opcional.
URLs de link externo e imagem devem usar HTTP ou HTTPS. A API gera o `id` com
`nanoid`.

As respostas são `201` para criação, `400` para entrada inválida e `401` quando
a credencial administrativa está ausente ou inválida.

## Banco de dados

A migration `20261021000000_create_products.sql` cria `products` com os campos
definidos no catálogo, incluindo `image_url`, necessário para a apresentação da
imagem na Home. O campo `score` permanece booleano conforme a spec e tem valor
padrão `false`; seu significado não é usado como média ou nota das avaliações.
