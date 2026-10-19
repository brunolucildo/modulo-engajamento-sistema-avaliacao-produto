# Sign-Up (Criação de conta)

## Escopo

Front-End, Back-End, Banco de dados

## Contexto

Precisamos implementar o fluxo de criação de contas na plataforma, as pessoas precisarão fornecer:

- Nome
- Sobrenome
- Email
- Senha
- Confirmação de senha

## Requisitos Funcionais

1. Precisamos adicionar validação no formulário na camada de cliente
    1. Caso o formulário esteja válido podemos enviar a requisição para a API
2. Os campos de nome e sobrenome devem ser separados
3. Precisamos criar uma nova conta no banco de dados na tabela de `accounts`
    1. `id`: nanoid (gerado com `nanoid` na camada de API)
    2. `first_name`: text
    3. `last_name`: text
    4. `created_at`: timestamp
    5. `updated_at`: timestamp
    6. `active`: boolean
    7. `email`: text
    8. `password`: text (hashed)
    9. `salt`: text (salt gerado pelo bcryptjs; o hash bcrypt também incorpora o salt)
4. A requisição deve ser um `POST` para `/api/v1/sign-up` e receber os dados com JSON no `body`
5. Caso tudo dê certo retornar `201` ou erros de acordo com a validação:
   1. `400`: Má formatação de dados
   2. `409`: Já existe uma conta cadastrada com o email informado

## Requisitos Não Funcionais

- Segurança: Precisamos salvar as senhas de forma segura no banco de dados
  - Precisamos receber os dados do cliente de forma segura usando HTTPS (para previnir network sniff)
- UI/UX: Boa experiência de uso através de uma interface bonita, elegante, moderna
- Performance: O processo de criação de conta precisa ser rápido

## Você Deve

- Criar a base do projeto com um endpoint inicial para criação de conta
- Cria a base do projeto com uma página inicial para a interface de criação de conta
- Configurar as bibliotecas base

## Você Não Deve

- Implementar qualquer outra funcionalidade que não esteja relacionado com o sign-up (criação de contas).
- Não vamos realizar nenhum envio de email no momento, apenas processar a requisição, salvar no banco de dados e retornar um sucesso.

## Tecnologias (Stack)

React.js, Next.js, React-Hook-Form, Shadcn, Tailwind, Supabase, bcryptjs, nanoid, Bunjs.

> O salt do bcrypt não é um hash independente nem um segredo: ele é armazenado como texto e também está incorporado no hash da senha.

## Critérios de aceitação

- Temos uma página para criar a nova conta em `/auth/sign-up`
- A página contém um formulário com validação
- A plataforma consegue se comunicar com a API para enviar os dados e receber uma resposta
- Estamos informado possíveis erros
  - Mostrar um alert em vermelho no formulário
- Estamos informado o sucesso de criação da conta:
  - Navegar para `/auth/sign-up/success`

## Resultado

Pessoas conseguem criar uma nova conta na plataforma
