# Produtos

## Listar produtos

`GET /api/v1/products` retorna produtos públicos em páginas de 12 itens,
ordenados por `created_at` e `id` em ordem decrescente. A resposta tem o formato
`{ "products": [...], "nextCursor": "..." }`; `nextCursor` será `null` quando
não houver outra página. Envie o cursor retornado como parâmetro `cursor` na
próxima requisição. Uma coleção vazia retorna `200` com `products: []` e
`nextCursor: null`.

Cada produto expõe `id`, `name`, `price`, `link` e `image`. Os quatro campos
são strings.

## Criar produto

`POST /api/v1/products` é público e não exige autenticação. Qualquer pessoa
que alcance a API pode cadastrar produtos; considere proteger a rota antes de
expô-la a tráfego não confiável.

Envie um JSON com `name`, `price`, `link` e `image`, todos obrigatórios e como
strings não vazias, sem limite máximo de caracteres definido pela aplicação.
`link` e `image` devem ser URLs HTTP ou HTTPS. A API gera o `id` com `nanoid`.

```json
{
  "name": "Nome do produto",
  "price": "R$ 99,90",
  "link": "https://www.amazon.com.br/dp/ASIN",
  "image": "https://m.media-amazon.com/images/...jpg"
}
```

As respostas são `201` para criação e `400` para entrada inválida.

## Banco de dados

A migration `20261022000000_update_products_fields.sql` migra a tabela para os
campos `name`, `price`, `link` e `image`, preservando os links e imagens já
cadastrados. Produtos anteriores à migração recebem `price` vazio; a coluna
`description` é removida, descartando as descrições já cadastradas.
