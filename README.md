# Blog Management REST API with Authentication

A full-stack blog app: users register, log in, and manage their own posts through a secure REST API.
Backend: Node.js + Express + PostgreSQL + JWT. Frontend: React + Vite with a glass + clay UI.

## Project structure

```
blog-project/
├── blog-api/
│   ├── src/
│   │   ├── config/db.js              pg connection pool
│   │   ├── controllers/              authController, userController, postController
│   │   ├── middleware/               auth.js, validate.js, errorHandler.js, notFound.js
│   │   ├── routes/                   authRoutes, userRoutes, postRoutes
│   │   ├── validators/schemas.js     Joi schemas
│   │   ├── docs/swagger.js           OpenAPI spec (served at /docs)
│   │   ├── app.js                    Express app setup
│   │   └── server.js                 starts the server
│   ├── sql/schema.sql                tables + indexes (safe to re-run)
│   ├── .env.example
│   └── package.json
└── blog-frontend/
    ├── src/{api, context, components, pages, styles}
    ├── .env.example
    ├── vercel.json
    └── package.json
```

---

## 1. Prerequisites

- Node.js 18 or newer (`node -v`)
- PostgreSQL 14+ (remember the password you set for the `postgres` user)
- Git
- VS Code
- Postman or Thunder Client

## 2. Create the local database

Open a terminal (PowerShell / Command Prompt on Windows) and run:

```bash
psql -U postgres -c "CREATE DATABASE blogdb;"
psql -U postgres -d blogdb -f blog-api/sql/schema.sql
```

If `psql` is not recognised on Windows, use pgAdmin instead: create a database named `blogdb`, open the Query Tool, paste the contents of `blog-api/sql/schema.sql`, and run it.

## 3. Start the backend

```bash
cd blog-api
npm install
copy .env.example .env      # Windows (Command Prompt). On PowerShell/Mac/Linux: cp .env.example .env
```

Open `.env` and fill in the values (see section 5), then:

```bash
npm run dev
```

You should see `Database connected` and `Server running on http://localhost:5000`.

## 4. Start the frontend

In a second terminal:

```bash
cd blog-frontend
npm install
copy .env.example .env      # Windows (Command Prompt). On PowerShell/Mac/Linux: cp .env.example .env
npm run dev
```

Open http://localhost:5173

## 5. Environment variables

**blog-api/.env**

| Variable | Example | Meaning |
|---|---|---|
| PORT | 5000 | Port the API listens on |
| DATABASE_URL | postgresql://postgres:yourpassword@localhost:5432/blogdb | PostgreSQL connection string |
| JWT_SECRET | a long random string | Secret used to sign tokens. Keep it private |
| CLIENT_URL | http://localhost:5173 | Frontend origin allowed by CORS (no trailing slash) |
| NODE_ENV | development | `production` turns on SSL for the database and hides error details |

Generate a strong secret with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

**blog-frontend/.env**

| Variable | Example |
|---|---|
| VITE_API_URL | http://localhost:5000/api |

Never commit `.env` files. The `.gitignore` files already exclude them.

## 6. Verify everything works

1. Open http://localhost:5000/docs (Swagger UI).
2. Run `POST /api/auth/register`, then `POST /api/auth/login`.
3. Copy the `token` from the response, click **Authorize** at the top, paste it, and try the protected routes.
4. Open http://localhost:5173, sign up, create a post, edit it, and delete it.

## 7. API test checklist (Postman / Thunder Client)

For protected routes add the header `Authorization: Bearer <token>`.

| # | Request | Expected |
|---|---|---|
| 1 | POST /api/auth/register with valid body | 201, returns user + token |
| 2 | POST /api/auth/register with same email again | 409 |
| 3 | POST /api/auth/register with password "123" | 400 |
| 4 | POST /api/auth/login with correct credentials | 200, returns token |
| 5 | POST /api/auth/login with wrong password | 401 |
| 6 | GET /api/users/me without token | 401 |
| 7 | GET /api/users/me with token | 200 |
| 8 | POST /api/posts with token and valid body | 201 |
| 9 | POST /api/posts without token | 401 |
| 10 | POST /api/posts with title "ab" | 400 |
| 11 | GET /api/posts | 200, includes pagination |
| 12 | GET /api/posts?page=1&limit=5&search=node | 200, filtered |
| 13 | GET /api/posts?category=Technology | 200, filtered |
| 14 | GET /api/posts/mine with token | 200, only your posts |
| 15 | GET /api/posts/:id (existing) | 200 |
| 16 | GET /api/posts/99999 | 404 |
| 17 | PUT /api/posts/:id as the owner | 200 |
| 18 | PUT /api/posts/:id as a different user | 403 |
| 19 | DELETE /api/posts/:id as a different user | 403 |
| 20 | DELETE /api/posts/:id as the owner | 200 |
| 21 | GET /api/unknown | 404 |

To test 18 and 19, register a second user and use that user's token on the first user's post.

## 8. Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `Database connection failed: ECONNREFUSED` | PostgreSQL not running or wrong port | Start the PostgreSQL service; check DATABASE_URL host/port |
| `password authentication failed` | Wrong password in DATABASE_URL | Use the password you set for the `postgres` user |
| `database "blogdb" does not exist` | Database not created | Run the `CREATE DATABASE` command in section 2 |
| `relation "users" does not exist` | schema.sql not run | Run `sql/schema.sql` on `blogdb` |
| CORS error in browser console | CLIENT_URL does not match frontend URL | Set CLIENT_URL exactly (e.g. `http://localhost:5173`, no trailing slash) and restart the API |
| `Invalid or expired token` | Token expired (1 day), or JWT_SECRET changed | Log in again |
| 401 on every protected call | Missing `Bearer ` prefix | Header must be `Authorization: Bearer <token>` |
| `EADDRINUSE: port 5000` | Another process uses the port | Change PORT in `.env`, or stop the other process |
| Frontend shows "Cannot reach the server" | API not running or wrong VITE_API_URL | Start the API; restart `npm run dev` after editing the frontend `.env` |
| `Missing JWT_SECRET in .env` | `.env` not created or empty | Copy `.env.example` to `.env` and fill it in |

## 9. Git setup

```bash
cd blog-project            # the folder containing blog-api and blog-frontend
git init
git add .
git commit -m "Initial commit: blog API and frontend"
```

Confirm `.env` is not tracked: `git status` must not list it. Then create a GitHub repository and:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

For Render and Vercel it is easiest to keep two repositories (one for `blog-api`, one for `blog-frontend`), or one repository and set the root directory per service.

---

## 10. Deployment (only after everything works locally)

### Supabase (database)
1. Create a project at supabase.com and set a database password.
2. Open **SQL Editor**, paste `blog-api/sql/schema.sql`, and run it.
3. Go to **Project Settings → Database → Connection string** and copy the URI. Replace `[YOUR-PASSWORD]` with your password.
4. If the direct connection fails from Render (some networks only support IPv6 on the direct host), use the **pooler** connection string instead.

### Render (backend)
1. New → **Web Service**, connect your GitHub repo, set the root directory to `blog-api` if needed.
2. Build command: `npm install`  |  Start command: `npm start`
3. Environment variables:
   - `DATABASE_URL` = your Supabase connection string
   - `JWT_SECRET` = a long random string
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = your Vercel URL (add it after step below, then redeploy)
4. After deploy you get a URL like `https://your-blog-api.onrender.com`. Check `/docs`.

### Vercel (frontend)
1. Import the frontend repo (root directory `blog-frontend` if needed). Framework preset: Vite.
2. Environment variable: `VITE_API_URL` = `https://your-blog-api.onrender.com/api`
3. `vercel.json` (already included) makes page refreshes work with React Router.
4. Copy the Vercel URL back into Render's `CLIENT_URL` and redeploy the backend.

### Before a demo
- Render's free tier sleeps when idle, so the first request can take 30-60 seconds. Open `https://your-blog-api.onrender.com/docs` a few minutes beforehand.
- Supabase free projects can pause after inactivity. Open the dashboard and restore the project if needed.

---

## 11. Viva cheat sheet

**1. Why do we hash passwords?**
If the database leaks, attackers should not get usable passwords. bcrypt adds a random salt and is deliberately slow, which makes brute-forcing expensive.

**2. What is a JWT and what is its structure?**
A signed token with three parts: header.payload.signature. The server signs it with JWT_SECRET, so it can verify the token later without storing sessions. The payload is readable by anyone, so never put secrets in it.

**3. 401 vs 403?**
401 Unauthorized: we don't know who you are (no token, or an invalid/expired one). 403 Forbidden: we know who you are, but you aren't allowed to do this (e.g. editing someone else's post).

**4. Authentication vs authorization?**
Authentication answers "who are you?" (login + JWT check in `middleware/auth.js`). Authorization answers "are you allowed to do this?" (the owner check in `postController.js`).

**5. How do you prevent SQL injection?**
All queries use parameterized placeholders (`$1`, `$2`). The database treats user input as data, never as SQL code.

**6. What is CORS and why configure it?**
Browsers block a page on one origin from calling an API on another unless the API allows it. We allow only `CLIENT_URL` so random websites can't call the API from a user's browser.

**7. What is middleware?**
A function that runs between the request and the final handler, with access to `req`, `res`, and `next`. Examples here: `auth`, `validate`, `helmet`, `cors`, the error handler.

**8. What makes this API RESTful?**
Resources are nouns in URLs (`/posts`), HTTP methods express actions (GET, POST, PUT, DELETE), responses use proper status codes, and the server is stateless because each request carries its own token.

**9. How does pagination work?**
The client sends `page` and `limit`. The server uses `LIMIT` and `OFFSET`, plus a `COUNT(*)` to return `total` and `totalPages`. This keeps responses small and fast.

**10. Why Supabase, Render and Vercel?**
Each has a free tier and does one job well: Supabase hosts managed PostgreSQL, Render runs the Node server, Vercel serves the static React build from a CDN. Splitting them also demonstrates a real three-tier architecture.
