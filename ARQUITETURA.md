# Vem Pra Orla: arquitetura e decisões

Documento de referência do TCC. Descreve o que foi construído, como as partes se conversam e por que as escolhas foram feitas.

## 1. Visão geral

O sistema reúne quatro peças: **login**, **dados de clima**, **ocorrências registradas por usuários** e um **índice de lazer** que combina as duas últimas. Três funcionalidades consomem esse núcleo: o **resumo por e-mail**, o **assistente de IA** e as **atividades recomendadas**.

```
[Frontend React] --HTTP--> [API NestJS] --> [Supabase] (banco PostgreSQL e login)
                                  |-------> [Open-Meteo] (clima e previsão)
                                  |-------> [Gmail SMTP] (resumo por e-mail)
                                  '-------> [API do Claude] (assistente de IA)
```

O frontend fala só com o backend (e com o Supabase para o login). O backend é quem chama Open-Meteo, e-mail e IA, então nenhuma chave de API fica no navegador.

## 2. Stack

| Camada | Tecnologia | Motivo |
|---|---|---|
| Frontend | React, Vite, TypeScript, Bootstrap, Chart.js | Reaproveita o visual do protótipo em HTML. |
| Backend | Node.js, NestJS, TypeScript | Módulos claros (auth, ocorrências, clima, índice, perfil, notificações, chat). |
| Banco e login | Supabase (PostgreSQL e Auth com Google) | Login com Google sem implementar OAuth manualmente. |
| ORM | Prisma 6 | Schema legível e tipos gerados. |
| Clima | Open-Meteo | Gratuita, sem chave e sem cadastro. |
| E-mail | Nodemailer com Gmail (senha de app) | Sem domínio nem serviço externo. Serve a um protótipo. |
| Agendamento | `@nestjs/schedule` | Dentro do próprio backend, sem cron externo. |
| IA | API do Claude (`claude-haiku-5-5`) | Modelo rápido e barato; contexto injetado no prompt, sem RAG. |

## 3. Modelo de dados

Duas tabelas próprias. Clima e índice não são guardados: são calculados na hora.

```
profiles   (estende o usuário do Supabase Auth)
  id (uuid, pk = id do usuário no Supabase Auth)
  email
  notificacoes_ativas (boolean)
  criado_em

occurrences
  id (uuid, pk)
  user_id (fk -> profiles)
  tipo     (lixo | poluicao_sonora | animal | seguranca | outro)
  local
  descricao (opcional)
  impacto  (baixo | medio | alto)
  criado_em
```

O perfil é criado por um gatilho do banco quando o usuário entra pela primeira vez. A preferência de notificação nasce desligada (consentimento explícito).

## 4. Principais fluxos

**Índice de lazer.** O backend busca o clima na Open-Meteo (cache de 30 minutos em memória), lê as ocorrências das últimas 24 horas e calcula o índice. O cálculo está em [docs/INDICE-DE-LAZER.md](docs/INDICE-DE-LAZER.md).

**Autenticação.** O frontend faz login com o Supabase e envia o token no cabeçalho `Authorization`. Um *guard* do NestJS valida o token no Supabase e coloca o usuário na requisição. As rotas de escrita usam o id vindo do token.

**Resumo por e-mail.** Todos os dias às 8h (horário de Porto Alegre), o backend monta o resumo uma única vez e envia a quem ativou a notificação. Há também um botão para enviar na hora, usado nos testes e na demonstração.

**Assistente de IA.** A cada pergunta, o backend monta um contexto com índice, clima, previsão e ocorrências recentes, e o injeta no prompt do sistema. O modelo só responde com base nesses dados. Não há histórico guardado em banco; a conversa fica na tela aberta.

**Atividades recomendadas.** Calculadas no navegador por regras simples sobre o clima e o índice (por exemplo, "pedalar" exige sem chuva, vento fraco e índice 3 ou mais).

## 5. Segurança

- **Banco:** o Supabase está com a Data API desligada e RLS ativa; todo acesso passa pelo backend, via Prisma. Como o Prisma ignora a RLS, a proteção está no guard e no uso do id do token.
- **Chaves:** ficam só no `.env` do backend, fora do repositório.
- **Chat:** limite de 20 mensagens por hora por usuário; nenhum dado pessoal vai ao modelo; textos de usuários são limpos, cortados e escapados antes de entrar no prompt; o chat só lê dados, não executa ações. As instruções do modelo tratam mensagens e dados como informação, e não como ordens. Isso reduz o risco de *prompt injection*, mas não o elimina.
- **Privacidade:** o aviso no sistema descreve os dados tratados e quem os processa.

## 6. Trabalhos futuros

- Notificação por WhatsApp (API oficial), incluindo grupos.
- Calibrar os pesos do índice com avaliações reais de usuários.
- Moderação das ocorrências e histórico do índice.
- Deploy em servidor próprio, com envio agendado sempre ativo.
