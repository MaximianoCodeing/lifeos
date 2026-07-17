# LifeOS

Plataforma pessoal de organização, produtividade, aprendizagem e gestão de informação, com IA integrada. Backend testado ponta a ponta (registo → login → CRUD de todos os módulos), frontend com build de produção validado (`next build` sem erros).

## Estrutura

```
lifeos/
├── backend/    # FastAPI + SQLAlchemy + PostgreSQL
├── frontend/   # Next.js + Tailwind + shadcn/ui
└── docker-compose.yml
```

## Como correr (Docker — recomendado)

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

- Backend: http://localhost:8000 (docs em `/docs`)
- Frontend: http://localhost:3000

## Como correr manualmente

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # ajustar DATABASE_URL se necessário
alembic revision --autogenerate -m "init"
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Módulos implementados (funcionais, ligados a BD real)

- **Auth**: registo, login, refresh JWT, password hashing (bcrypt puro).
- **Dashboard**: saudação, próximos eventos/tarefas, hábitos do dia, objetivos, pomodoros de hoje.
- **Tarefas**: CRUD, prioridade, checklist, lixeira (soft delete).
- **Projetos**: CRUD, progresso.
- **Agenda/Calendário**: eventos + tarefas com data fundidos numa vista mensal.
- **Pomodoro**: temporizador persistido (sessões guardadas no backend), Modo Focus.
- **Objetivos**: CRUD, progresso, sugestão de plano via IA.
- **Hábitos**: CRUD, check-in diário, streak.
- **Diário**: entradas por dia (humor/energia/produtividade), resumo automático por IA.
- **Notas**: editor Markdown com autosave (debounce), páginas aninhadas (parent_id).
- **Biblioteca**: upload inteligente ("o que pretendes fazer?" → guardar/resumir/flashcards/checklist).
- **Flashcards**: decks, cartões, repetição espaçada (SM-2), revisão diária.
- **IA**: assistente conversacional (`/ia`), resumo de documentos e diário, planos de objetivos.
- **Estatísticas**: overview + gráfico de pomodoros dos últimos 30 dias.
- **Pesquisa global**: `/search` — tarefas, projetos, notas, documentos, hábitos, flashcards.
- **Lixeira**: listagem, restauro e eliminação definitiva, genérica para todas as entidades.
- **Importação/Exportação**: Excel/CSV → tarefas automaticamente; flashcards com deteção de colunas e deduplicação; exportação JSON/CSV/Markdown.
- **Notificações**: modelo + endpoints prontos (o disparo automático via Celery fica para a fase de polimento).
- **Command Palette** (Ctrl/⌘K), dark/light/system mode, sidebar completa.

## Simplificações conscientes (a refinar depois)

- **Notas**: editor em Markdown simples, não o editor de blocos completo (imagens/vídeo/tabelas inline) do pedido original.
- **Tags**: campo JSON por entidade, em vez de uma tabela relacional global de tags pesquisável.
- **IA**: `ai_service` funciona em modo simulado sem `ANTHROPIC_API_KEY` configurada — define a variável de ambiente para respostas reais.
- **Notificações automáticas** (lembretes de pomodoro, hábitos pendentes, etc.) e **backup agendado**: a infraestrutura (Celery) está pronta, falta ligar as tarefas periódicas (`celery beat`).
- **Calendário**: vista mensal simples; arrastar/redimensionar eventos fica para iteração seguinte.

## Testes já correram com sucesso

- Backend: `py_compile` em todos os ficheiros + teste end-to-end (registo, login, tarefas, flashcards com repetição espaçada, diário com IA, dashboard, stats, pesquisa) usando SQLite em memória.
- Frontend: `tsc --noEmit` sem erros e `next build` de produção com as 18 rotas geradas com sucesso.

## Deploy sugerido

**Railway** (mais simples: frontend + backend + worker + Postgres + Redis no mesmo projeto) ou **Vercel (frontend) + Render/Railway (backend+worker) + Neon (Postgres) + Upstash (Redis)**.
