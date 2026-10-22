# EventoSENAI

Agenda de eventos escolares: os alunos se inscrevem em palestras, oficinas e workshops.

O sistema tem três camadas:

```
Front (Next.js :3000)  ──fetch──▶  API (Express :3333)  ──mysql2──▶  MySQL (eventosenai)
```

## Estrutura

```
evento-senai/
├── database/
│   └── script.sql        # criação do banco, tabelas e dados iniciais
├── api/
│   ├── src/
│   │   ├── db.js
│   │   ├── server.js
│   │   └── routes/
│   │       ├── eventos.js
│   │       ├── participantes.js
│   │       └── inscricoes.js
│   ├── .env              # não vai para o GitHub
│   └── package.json
└── front/
    ├── app/
    │   ├── layout.js
    │   ├── page.js
    │   └── globals.css
    ├── components/
    │   ├── EventoCard.js
    │   ├── FormParticipante.js
    │   └── FormInscricao.js
    ├── lib/
    │   └── api.js
    ├── .env.local        # não vai para o GitHub
    └── package.json
```

## Como rodar

### 1. Banco de dados

Abra o `database/script.sql` no MySQL Workbench e execute tudo (⚡).

### 2. API

Crie o arquivo `api/.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=senai
DB_NAME=eventosenai
PORT=3333
```

```bash
cd api
npm install
npm run dev
```

### 3. Front-end

Crie o arquivo `front/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3333
```

```bash
cd front
npm install
npm run dev
```

Acesse http://localhost:3000.

## Rotas da API

| Método | Rota | Descrição | Respostas |
| --- | --- | --- | --- |
| GET | `/eventos` | Lista eventos com categoria, inscritos e vagas restantes | 200 |
| GET | `/eventos/:id` | Busca um evento | 200, 404 |
| GET | `/eventos/:id/participantes` | Participantes inscritos no evento | 200, 404 |
| POST | `/eventos` | Cria evento | 201, 400 |
| PUT | `/eventos/:id` | Atualiza evento | 200, 400, 404 |
| DELETE | `/eventos/:id` | Remove evento | 204, 404 |
| GET | `/participantes` | Lista participantes | 200 |
| GET | `/participantes/:id` | Busca um participante | 200, 404 |
| POST | `/participantes` | Cadastra participante | 201, 400, 409 (e-mail repetido) |
| PUT | `/participantes/:id` | Atualiza participante | 200, 400, 404, 409 |
| DELETE | `/participantes/:id` | Remove participante | 204, 404 |
| GET | `/inscricoes` | Lista inscrições | 200 |
| POST | `/inscricoes` | Inscreve participante em evento | 201, 400, 404, 409 (repetida ou lotado) |
| DELETE | `/inscricoes/:id` | Cancela inscrição | 204, 404 |

Todas as consultas usam parâmetros (`?`) do mysql2, o que protege contra SQL Injection.

## Erro de inscrição duplicada

Ao tentar inscrever o mesmo participante duas vezes no mesmo evento, o MySQL devolve:

```
Error Code: 1062. Duplicate entry '1-1' for key 'inscricoes.uq_evento_participante'
```

Na API esse erro chega como `err.code === 'ER_DUP_ENTRY'` e é convertido em **409 Conflict**.