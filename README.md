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
