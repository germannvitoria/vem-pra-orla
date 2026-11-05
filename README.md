# Vem Pra Orla

Sistema web que mostra as condições da **Orla do Guaíba (Porto Alegre)** combinando a **previsão do tempo** com **ocorrências registradas pelos próprios frequentadores** (lixo, poluição sonora, animais, segurança) em um **índice de lazer de 0 a 5**.

Trabalho de Conclusão de Curso — IFRS Campus Porto Alegre.
Autora: Vitória Generoso Germann.

> O índice é uma **estimativa heurística**, e não um aviso oficial. Veja [como ele é calculado](docs/INDICE-DE-LAZER.md).

## Funcionalidades

- Login com conta Google (Supabase Auth).
- Clima atual e previsão dos próximos 5 dias (Open-Meteo), com gráfico.
- Índice de lazer de 0 a 5, com a explicação dos fatores que pesam nele.
- Registro, edição e exclusão de ocorrências (cada pessoa altera só as suas).
- Atividades recomendadas, a partir de regras simples sobre o clima e o índice.
- Resumo diário por e-mail, para quem ativar a opção (envio automático às 8h e botão de envio imediato).
- Assistente de IA (chat) que responde sobre as condições de agora, usando os dados do sistema.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React, Vite, TypeScript, Bootstrap, Chart.js |
| Backend | Node.js, NestJS, TypeScript, Prisma 6 |
| Banco e login | Supabase (PostgreSQL e Auth com Google) |
| Clima | Open-Meteo (sem chave de API) |
| E-mail | Nodemailer com SMTP do Gmail (senha de app) |
| Agendamento | `@nestjs/schedule` |
| Chat | API do Claude (Anthropic), modelo `claude-haiku-5-5` por padrão |

A arquitetura e as decisões estão em [ARQUITETURA.md](ARQUITETURA.md).

## Como rodar localmente

O projeto roda em localhost (não há deploy). Requisitos: Node.js (versão LTS), uma conta no Supabase com login Google configurado, e, para as funções opcionais, uma conta Gmail com senha de app e uma chave de API da Anthropic.

### 1. Banco de dados (Supabase)

1. Crie um projeto no Supabase e ative o provedor **Google** em *Authentication → Providers*.
2. Crie as tabelas `profiles` e `occurrences` conforme o modelo de `backend/prisma/schema.prisma`. O banco foi criado por SQL manual, sem migrations.
3. Para o perfil nascer junto com o usuário, crie este gatilho no SQL Editor:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, notificacoes_ativas)
  values (new.id, new.email, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

Projetos gratuitos do Supabase são pausados após cerca de uma semana sem uso. Se o backend não conectar, restaure o projeto no painel.

### 2. Backend

```bash
cd backend
cp .env.example .env     # preencha os valores
npm install
npx prisma generate
npm run start:dev
```

A API sobe em `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env     # preencha os valores
npm install
npm run dev
```

O app abre em `http://localhost:5173`.

## Variáveis de ambiente

As listas completas estão em `backend/.env.example` e `frontend/.env.example`. **Nunca faça commit dos arquivos `.env`.**

**Backend**

| Variável | Para que serve |
|---|---|
| `DATABASE_URL` | Conexão do Supabase pelo pooler (porta 6543, com `?pgbouncer=true`) |
| `DIRECT_URL` | Conexão direta do Supabase (porta 5432) |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Validação do token de login |
| `FRONTEND_URL` | Origem permitida no CORS e link do e-mail |
| `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` | Envio de e-mail (Gmail com senha de app) |
| `ANTHROPIC_API_KEY` | Chat (opcional; sem ela o assistente fica indisponível) |
| `CHATBOT_MODEL` | Modelo do chat (opcional) |

**Frontend**

| Variável | Para que serve |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Login com Google |
| `VITE_API_URL` | Endereço do backend |

## Estrutura

```
vem-pra-orla/
├── backend/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── auth/            guard que valida o token do Supabase
│       ├── common/          PrismaService
│       ├── occurrences/     ocorrências (criar, listar, editar, excluir)
│       ├── weather/         clima atual e previsão (Open-Meteo, com cache)
│       ├── leisure-index/   cálculo do índice
│       ├── profile/         preferência de notificação
│       ├── notifications/   resumo por e-mail (manual e diário)
│       └── chatbot/         assistente de IA
├── frontend/src/            componentes React e lib/ (api, supabase, regras)
├── docs/INDICE-DE-LAZER.md  explicação do cálculo do índice
├── ARQUITETURA.md
└── README.md
```

## Endpoints principais

| Método e rota | Acesso | Descrição |
|---|---|---|
| `GET /weather` | público | Clima atual |
| `GET /weather/forecast` | público | Previsão de 5 dias |
| `GET /leisure-index` | público | Índice, fatores e clima |
| `GET /occurrences` | login | Lista as ocorrências |
| `POST /occurrences` | login | Cria uma ocorrência |
| `PATCH` e `DELETE /occurrences/:id` | login (só o autor) | Edita e exclui |
| `GET`, `PATCH /profile` | login | Lê e altera a preferência de notificação |
| `POST /notifications/test` | login | Envia o resumo agora para o seu e-mail |
| `POST /chatbot` | login | Pergunta ao assistente (limite de 20 por hora) |

## Segurança e privacidade

- Login e tokens ficam com o Supabase. O backend valida o token em cada rota protegida e usa o id vindo do token, nunca um id enviado pelo cliente.
- Chaves (Supabase, Gmail, Anthropic) ficam só no backend e fora do repositório.
- O chat não recebe nome, e-mail nem id de usuários, e o texto das ocorrências é limpo e tratado como dado. O risco de *prompt injection* é reduzido por instruções e por código, mas não eliminado.
- O aviso de privacidade do sistema descreve os dados usados e quem os processa (Supabase, Google, Open-Meteo e Anthropic).

## Limitações conhecidas

- O índice é heurístico: os pesos e limites foram escolhidos por critério próprio, sem calibração com dados reais.
- O envio diário das 8h só acontece enquanto o backend estiver ligado (execução local).
- O e-mail sai de uma conta Gmail comum, o que serve a um protótipo, e não a produção.
- Ocorrências não são moderadas nem verificadas.
- Não há testes automatizados nem deploy, por decisão de escopo do trabalho.
