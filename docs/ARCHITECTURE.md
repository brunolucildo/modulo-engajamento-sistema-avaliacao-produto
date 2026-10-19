# Arquitetura do Projeto

## Front-End

- TypeScript: Linguagem principal de desenvolvimento com tipagem
- Next.js: Framework para criação e gestão de interfaces
- React.js: Blibioteca para criação e componentização de interfaces
- Biome: Validação/formatação/correção de código (lint)
- TailwindCSS: Estilização
- Date-FNS: Manipulação de data/hora
- Shadcn: Compentização Base (design system)
- React Query: Criação e gestão de queries para ler dados da API e mutations para alterar dados.

## Back-End

- TypeScript: Linguagem principal de desenvolvimento com tipagem
- Next.js: Framework para criação de APIs
- bcryptjs: Geração de salt e hash de senha; não utilizar a API `crypto` nativa do Node.js
- Mastra.ai: Criação e customização de agentes internos
- TRPC: Gestão de endpoints

## Banco de dados

- Supabase: PostgreSQL

## Infraestrutura

- Vercel: Hospedar tanto o servidor (API) quando cliente (SPA)

## Automação

- N8N: Criação de fluxos automazidos
