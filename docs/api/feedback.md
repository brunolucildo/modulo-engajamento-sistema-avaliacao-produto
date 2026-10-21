# Avaliações de produtos

As avaliações são públicas para leitura e só podem ser criadas por uma pessoa
com sessão válida.

## Consultar avaliações

`GET /api/v1/products/[id]/feedback` retorna `200` com
`{ "feedbacks": [...] }`, ordenadas da mais recente para a mais antiga. Cada
item contém `id`, `score`, `comment` e `created_at`. A resposta contém uma lista
vazia quando o produto ainda não recebeu avaliações e `404` quando o produto
não existe.

## Criar avaliação

`POST /api/v1/products/[id]/feedback` recebe JSON neste formato:

```json
{
  "score": 5,
  "comment": "Gostei muito do produto."
}
```

A nota deve ser um número inteiro de 1 a 5. O comentário é normalizado com
trim, não pode ficar vazio e aceita até 2000 caracteres. A API obtém
`created_by` exclusivamente da sessão validada no servidor; esse campo não é
aceito no payload. A resposta `201` contém `{ "feedback": {...} }`.

Os códigos de resposta são `400` para JSON ou dados inválidos, `401` sem sessão,
`404` para produto inexistente e `500` para falha inesperada.

## Banco de dados

A migration `20261021000001_create_products_feedbacks.sql` cria
`products_feedbacks`, suas referências a `accounts(id)` e `products(id)`, a
restrição de nota e tamanho do comentário, e índices para consulta por produto
em ordem cronológica e por autor. Exclusões de conta ou produto removem suas
avaliações. Não há restrição de uma avaliação por pessoa e produto.
