# Plano: Sign-In (Autenticação)

## Objetivo

Permitir que uma pessoa com conta existente entre na plataforma usando email e
senha, receba uma sessão segura e veja sua identidade no cabeçalho.

## Escopo

- Nova página `/auth/sign-in` e formulário com validação no cliente.
- Novo endpoint `POST /api/v1/sign-in`.
- Verificação das credenciais na tabela `accounts`.
- Criação e leitura da sessão via cookie.
- Cabeçalho com acesso ao login para pessoas anônimas e identificação para
  pessoas autenticadas.
- Navegação para `/` após login bem-sucedido. A home será implementada no plano
  [Home](./home-plan.md).

Não inclui recuperação de senha, cadastro, envio de email, logout ou outras
funcionalidades de conta que não estejam definidas pela spec.

## Plano de implementação

1. **Definir o contrato da sessão**
   - Reutilizar o formato atual da conta: `accounts.email` e `accounts.password`,
     onde `password` contém o hash bcrypt criado no cadastro.
   - Definir uma forma de sessão assinada ou opaca, com validação no servidor,
     expiração e cookie `HttpOnly`, `SameSite=Lax`, `Path=/` e `Secure` em
     produção.
   - Se a estratégia depender de segredo, adicioná-lo somente à configuração do
     servidor e documentar a variável necessária; nunca expor credenciais ou
     tokens no cliente.
   - Consultar a documentação da versão instalada do Next.js antes de usar suas
     APIs de cookies.
2. **Adicionar validação compartilhada**
   - Criar um schema Zod para email e senha, reutilizável no formulário e na API.
   - Validar formato e limites de entrada sem retornar informação que permita
     distinguir email inexistente de senha incorreta.
3. **Implementar `POST /api/v1/sign-in`**
   - Aceitar JSON com `email` e `password`.
   - Retornar `400` para JSON inválido ou dados malformados.
   - Consultar a conta com email normalizado e comparar a senha com o hash usando
     `bcryptjs`.
   - Retornar a mesma mensagem genérica e status `401` para credenciais
     inválidas.
   - Em caso de sucesso, emitir o cookie de sessão e retornar `200`; não retornar
     hash, salt ou outros dados secretos.
   - Tratar e registrar falhas inesperadas no padrão já usado pelo endpoint de
     cadastro.
4. **Construir a tela e o formulário**
   - Adicionar `/auth/sign-in` e um componente de formulário baseado nos padrões
     visuais e de validação existentes em `/auth/sign-up`.
   - Enviar `POST /api/v1/sign-in`, mostrar erros de campo e um alerta vermelho
     genérico para falha de autenticação.
   - Desabilitar o envio enquanto a requisição estiver em andamento e navegar
     para `/` após sucesso.
5. **Expor o estado de autenticação no cabeçalho**
   - Implementar o cabeçalho compartilhado previsto no plano da Home.
   - Para pessoas anônimas, mostrar um link/botão para `/auth/sign-in`.
   - Para pessoas autenticadas, mostrar nome, sobrenome, email e avatar
     demonstrativo do DiceBear, sem depender de um serviço de avatar para
     autenticar.
   - Garantir que a sessão seja lida e validada no servidor; não confiar em
     estado enviado pelo navegador.
6. **Atualizar a documentação**
   - Documentar a rota, a configuração de sessão e os códigos de resposta no
     README ou na documentação técnica apropriada.

## Superfícies prováveis

- `src/app/auth/sign-in/page.tsx`
- `src/app/api/v1/sign-in/route.ts`
- `src/components/sign-in-form.tsx`
- `src/lib/sign-in-schema.ts`
- Novo helper server-only para criar/ler a sessão.
- Cabeçalho compartilhado e layout da plataforma, coordenados com o plano da
  Home.
- `README.md` e, se necessário, configuração de ambiente de exemplo.

## Contrato de API proposto

### Requisição

`POST /api/v1/sign-in`

```json
{
  "email": "pessoa@exemplo.com",
  "password": "senha"
}
```

### Respostas

- `200`: autenticação concluída; sessão definida em cookie.
- `400`: corpo JSON ou campos inválidos.
- `401`: email ou senha inválidos, sempre com mensagem genérica.
- `500`: falha inesperada, sem detalhes internos na resposta.

## Verificações e critérios de aceite

- O formulário bloqueia dados inválidos no cliente e a API também os rejeita.
- JSON inválido resulta em `400`; credenciais inválidas resultam sempre em
  `401` genérico.
- Credenciais válidas resultam em `200` e cookie de sessão com atributos
  seguros; nenhuma credencial é incluída na resposta.
- A pessoa autenticada é redirecionada para `/`.
- O cabeçalho diferencia corretamente estado anônimo e autenticado.
- Executar typecheck, lint e build; adicionar verificações focadas para schema,
  respostas da API e leitura da sessão conforme os padrões de teste disponíveis.

## Decisões/contratos a confirmar na aprovação

- A spec exige “criar uma sessão do Next.js com cookies”, mas não define formato,
  duração, renovação nem segredo. O plano pressupõe uma sessão validada no
  servidor e cookie seguro, sem adicionar serviço de autenticação externo.
- O cabeçalho é compartilhado com a Home: a implementação deve ter um único
  proprietário do layout/cabeçalho para evitar alterações concorrentes nos
  mesmos arquivos.
- O DiceBear será apenas uma imagem demonstrativa derivada de identificador não
  secreto; a identidade exibida deve vir dos dados confiáveis da sessão.
