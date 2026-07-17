# LifeOS — Guia Definitivo de Deploy (Railway)

Segue este documento do início ao fim, por ordem. Cada passo diz exatamente o que fazer.

---

## PARTE 1 — Corrigir o repositório GitHub

O problema atual: o upload feito pelo browser não enviou todos os ficheiros (falta o `Dockerfile` e `requirements.txt` do backend). Vamos substituir tudo pelo terminal, que é fiável.

### 1.1 Abre o terminal (PowerShell, CMD, ou Terminal) e navega até à pasta do projeto

```bash
cd caminho/para/a/pasta/lifeos
```

(a pasta onde descompactaste o `lifeos_completo.zip` — deve conter `backend/`, `frontend/`, `docker-compose.yml`, `README.md`)

### 1.2 Confirma que os ficheiros importantes existem localmente

```bash
dir backend\Dockerfile
dir backend\requirements.txt
```
(no Mac/Linux usa `ls backend/Dockerfile backend/requirements.txt` em vez de `dir`)

Se aparecerem os dois ficheiros, estás pronto para o passo seguinte. Se não aparecerem, avisa-me antes de continuar.

### 1.3 Reenvia tudo para o GitHub, substituindo o que lá está

```bash
git init
git remote remove origin
git remote add origin https://github.com/MaximianoCodeing/lifeos.git
git add -A
git commit -m "Reenviar projeto completo"
git branch -M main
git push -u origin main --force
```

Se pedir login, usa as tuas credenciais do GitHub (ou um token de acesso pessoal, se o GitHub pedir — em vez de password, cria um em github.com/settings/tokens).

### 1.4 Confirma no browser

Vai a `github.com/MaximianoCodeing/lifeos/tree/main/backend` e confirma que agora vês, entre outros:
- `Dockerfile`
- `requirements.txt`
- pasta `app/`
- `alembic.ini`

---

## PARTE 2 — Railway: Backend

### 2.1 No projeto que já criaste na Railway (o serviço `lifeos`)

1. Vai a **Settings → Source**
2. Confirma que **Root Directory** = `backend`
3. Vai a **Deployments** → **⋮** (três pontos) do último deployment → **Redeploy**

### 2.2 Espera o build (2-4 minutos)

Deve mudar de "Building" para **"Success"** (verde). Se falhar, manda-me o log — mas agora deve ser um erro diferente e específico (não mais "não encontro nada para buildar").

### 2.3 Gerar o URL público do backend

**Settings → Networking → Generate Domain**

Vai aparecer algo como `lifeos-production-xxxx.up.railway.app` — **copia este URL**, vais precisar dele duas vezes mais abaixo.

---

## PARTE 3 — Bases de dados

No dashboard do projeto (não dentro do serviço, no ecrã geral onde vês todos os cartões):

1. **New** → **Database** → **Add PostgreSQL**
2. **New** → **Database** → **Add Redis**

Não precisas de configurar nada — a Railway liga-as automaticamente ao serviço `lifeos` através das variáveis `DATABASE_URL` e `REDIS_URL`.

---

## PARTE 4 — Variáveis do backend

No serviço `lifeos` → separador **Variables** → adiciona (uma de cada vez, botão "New Variable"):

```
SECRET_KEY = uma-string-aleatoria-longa-e-secreta-qualquercoisa123456789
FRONTEND_ORIGIN = https://placeholder.up.railway.app
```

(`FRONTEND_ORIGIN` vai ser corrigido na Parte 6 — por agora só precisa de existir)

---

## PARTE 5 — Correr as migrações da base de dados

1. No serviço `lifeos`, procura o botão **"Shell"** ou os três pontinhos **⋮** → **"Open Shell"** (dá acesso a um terminal dentro do próprio servidor)
2. Corre:

```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```

Isto cria as tabelas na base de dados Postgres.

---

## PARTE 6 — Frontend

### 6.1 Criar o serviço

No dashboard do projeto → **New** → **GitHub Repo** → escolhe `lifeos` outra vez (o mesmo repositório)

### 6.2 Configurar

**Settings → Source → Root Directory** = `frontend`

### 6.3 Variável de ligação ao backend

**Variables** → adiciona:
```
NEXT_PUBLIC_API_URL = https://lifeos-production-xxxx.up.railway.app/api/v1
```
(usa o URL real que copiaste na Parte 2.3 — **não te esqueças do `/api/v1` no final**)

### 6.4 Deploy

Deve arrancar sozinho depois de gravares a variável. Espera até dar "Success".

### 6.5 Gerar o URL público do frontend

**Settings → Networking → Generate Domain** → copia este URL também.

---

## PARTE 7 — Fechar o ciclo

Volta ao serviço **`lifeos` (backend)** → **Variables** → edita `FRONTEND_ORIGIN`, substituindo o placeholder pelo URL real do frontend (Parte 6.5):

```
FRONTEND_ORIGIN = https://o-url-real-do-frontend.up.railway.app
```

Isto faz redeploy automático do backend.

---

## PARTE 8 — Testar

1. Abre o URL do frontend (Parte 6.5) no browser
2. **Criar conta** → preenche nome/email/password → **Criar conta**
3. **Entrar** com essas credenciais
4. Cria uma tarefa no Dashboard ou em "Tarefas"
5. Se aparecer guardada, está tudo ligado e a funcionar

---

## Se algo falhar

Em qualquer passo, se der erro:
- **Build failed** → manda-me print do **Build Logs** completo
- **Erro ao criar conta / "Load failed"** → confirma que `NEXT_PUBLIC_API_URL` (frontend) e `FRONTEND_ORIGIN` (backend) estão exatamente corretos, com `https://` e sem barra a mais/menos no fim
- **Erro nas migrações (Parte 5)** → manda-me o texto do erro que aparece no Shell
