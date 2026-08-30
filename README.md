# Blog Application REST API

REST API for a Blog Management Application — Assignment submission, **Batch 19** (Student ID **NK22278**).

Three access levels are supported — **Admin**, **User**, and **Guest** — with token-based JWT authentication, bcrypt-hashed passwords, Joi request validation, and a public guest flow for browsing / searching / filtering blogs.

---

## Tech Stack

| Concern        | Library                                     |
| -------------- | ------------------------------------------- |
| HTTP server    | Express 5                                   |
| ORM            | Sequelize 6                                 |
| Database       | MySQL 8 (default), SQLite (local dev fallback) |
| Auth           | JWT (`jsonwebtoken`)                        |
| Password hash  | `bcryptjs`                                  |
| Validation     | Joi                                         |
| Config         | `dotenv`                                    |

---

## Project Structure

```
blog-api/
├── .env.example              # template — copy to .env
├── .gitignore                # node_modules, .env, *.sqlite
├── package.json
├── README.md
├── postman/
│   └── Blog-API.postman_collection.json
├── scripts/
│   └── smoke.sh              # end-to-end smoke test
└── src/
    ├── server.js             # entry point
    ├── app.js                # Express app + route mounting
    ├── composition-root.js   # wires repositories -> services -> controllers/middleware
    ├── config/
    │   ├── index.js          # env-backed config
    │   └── database.js       # Sequelize bootstrap
    ├── models/
    │   ├── index.js          # associations
    │   ├── User.js           # users table (pure data shape + toSafeJSON)
    │   └── Blog.js           # blogs table (pure data shape + toPublicJSON)
    ├── repositories/         # data access, one class per aggregate
    │   ├── BaseRepository.js # generic CRUD over a Sequelize model
    │   ├── UserRepository.js
    │   └── BlogRepository.js
    ├── services/             # business rules, constructor-injected collaborators
    │   ├── PasswordHasher.js
    │   ├── TokenService.js
    │   ├── BlogAuthorizationPolicy.js
    │   ├── AuthService.js
    │   ├── UserService.js
    │   ├── BlogService.js
    │   └── AdminSeeder.js    # seeds default admin on first boot
    ├── controllers/          # thin, class-based — req/res translation only
    │   ├── authController.js
    │   ├── userController.js
    │   └── blogController.js
    ├── errors/                # ApiError + typed subclasses (400/401/403/404/409)
    │   ├── ApiError.js
    │   ├── BadRequestError.js
    │   ├── UnauthorizedError.js
    │   ├── ForbiddenError.js
    │   ├── NotFoundError.js
    │   ├── ConflictError.js
    │   └── index.js
    ├── middlewares/
    │   ├── auth.js           # createAuthMiddleware() -> { authenticate, authorize }
    │   ├── validate.js       # Joi-driven validation factory
    │   └── error.js          # 404 + central error handler
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   └── blogRoutes.js
    ├── validators/
    │   ├── authValidator.js
    │   └── blogValidator.js
    └── utils/
        ├── asyncHandler.js
        └── jwt.js
```

### Architecture

The app follows a layered, SOLID-aligned structure: `routes → controllers → services → repositories → Sequelize models`. Controllers only translate HTTP req/res; business rules (password hashing, JWT issuance, blog-ownership authorization, self-deactivation guard) live in `services/`; data access is isolated in `repositories/`, all extending a common `BaseRepository`. Every dependency is constructor-injected and wired once in `composition-root.js`, and errors are typed subclasses of `ApiError` (`NotFoundError`, `ForbiddenError`, etc.) instead of a single generic error with a magic status code.

---

## Database Schema

Two tables live in the `blogdb` database.

### `users`

| Column     | Type / Notes                                     |
| ---------- | ------------------------------------------------ |
| id         | PK, auto-increment                               |
| firstname  | VARCHAR(100), required                           |
| lastname   | VARCHAR(100), required                           |
| email      | VARCHAR(150), required, **unique**               |
| password   | VARCHAR(255), bcrypt-hashed, required            |
| isActive   | BOOLEAN, default `true`                          |
| role       | ENUM('user','admin'), default `'user'`           |
| createAt   | DATETIME                                         |
| updateAt   | DATETIME                                         |

### `blogs`

| Column     | Type / Notes                                  |
| ---------- | --------------------------------------------- |
| id         | PK, auto-increment                            |
| userId     | FK → `users.id`, `ON DELETE CASCADE`          |
| blogTitle  | VARCHAR(255), required                        |
| blog       | TEXT, required                                |
| category   | VARCHAR(100), required                        |
| createAt   | DATETIME                                      |
| updateAt   | DATETIME                                      |

---

## Getting Started

### 1. Install

```bash
git clone <repo-url>
cd blog-api
npm install
```

### 2. Configure

Copy `.env.example` to `.env` and edit the values.

```bash
cp .env.example .env
```

`.env` keys:

```
PORT=3000
NODE_ENV=development

# MySQL (per assignment spec)
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=blogdb
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
```

> If you don't have a MySQL server handy, set `DB_DIALECT=sqlite` and
> `DB_STORAGE=./blogdb.sqlite` for a zero-config local dev. The same Sequelize
> models back both dialects.

### 3. Create the database (MySQL)

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS blogdb;"
```

### 4. Run

```bash
npm start
```

On first boot the server:

- synchronizes the schema (`users` + `blogs`, with FK from `blogs.userId → users.id`)
- **seeds a default admin** so you can immediately log in:
  - email: `admin@example.com`
  - password: `password123`

The first non-admin user can be promoted manually with:

```sql
UPDATE users SET role = 'admin' WHERE email = 'someone@example.com';
```

---

## API Reference

All endpoints are mounted under `/api`. All payloads are JSON.

### Auth

| Method | Path                  | Auth     | Purpose                                                |
| ------ | --------------------- | -------- | ------------------------------------------------------ |
| POST   | `/api/auth/register`  | Public   | Register a new user.                                   |
| POST   | `/api/auth/login`     | Public   | Log in, receive a JWT token.                           |

### Users

| Method | Path                              | Auth          | Purpose                                          |
| ------ | --------------------------------- | ------------- | ------------------------------------------------ |
| GET    | `/api/users`                      | Admin         | List all users (no passwords).                   |
| GET    | `/api/users/:id`                  | Admin         | Get a specific user (no password).               |
| PATCH  | `/api/users/:id/status`           | Admin         | Activate / deactivate a user.                    |
| GET    | `/api/users/profile`              | User or Admin | Get own profile.                                 |
| PUT    | `/api/users/profile/update`       | User or Admin | Update own profile (`firstname`, `lastname`, `email`). |
| PATCH  | `/api/users/password`             | User or Admin | Update own password.                             |

### Blogs

| Method | Path                       | Auth          | Purpose                                                                  |
| ------ | -------------------------- | ------------- | ------------------------------------------------------------------------ |
| POST   | `/api/blogs/create`        | User or Admin | Create a blog. `userId` is taken from the token, not the request body.   |
| GET    | `/api/blogs`               | Public        | List blogs. Supports `?title=...` (partial match) and `?category=...`.   |
| GET    | `/api/blogs/:id`           | Public        | Get a specific blog (with author).                                       |
| PUT    | `/api/blogs/update/:id`    | User or Admin | Update a blog. Users can update only their own; admins can update any.   |
| DELETE | `/api/blogs/delete/:id`    | User or Admin | Delete a blog. Users can delete only their own; admins can delete any.   |

---

## Authentication

Protected endpoints expect:

```
Authorization: Bearer <token>
```

The token is returned by `/api/auth/login` and is signed with `JWT_SECRET` for `JWT_EXPIRES_IN`. The login test scripts in Postman save the token to the collection variable `{{token}}`.

---

## Authorization Matrix

| Action                                | Guest | User | Admin |
| ------------------------------------- | :---: | :--: | :---: |
| Register / Login                      |  ✅   | ✅   |  ✅   |
| View all blogs / blog by id           |  ✅   | ✅   |  ✅   |
| Search / filter blogs                 |  ✅   | ✅   |  ✅   |
| Create blog                           |  ❌   | ✅   |  ✅   |
| Update / delete **own** blog          |  ❌   | ✅   |  ✅   |
| Update / delete **another** user's blog | ❌   | ❌   |  ✅   |
| View / update **own** profile         |  ❌   | ✅   |  ✅   |
| Update **own** password               |  ❌   | ✅   |  ✅   |
| View all users / view user by id      |  ❌   | ❌   |  ✅   |
| Activate / deactivate users           |  ❌   | ❌   |  ✅   |

---

## HTTP Status Codes

| Code | Meaning                                                       |
| ---- | ------------------------------------------------------------- |
| 200  | OK — successful read / update / delete                        |
| 201  | Created — successful registration or blog creation            |
| 400  | Bad Request — validation failure                              |
| 401  | Unauthorized — missing or invalid token                       |
| 403  | Forbidden — authenticated but lacks permission                |
| 404  | Not Found — user / blog / route does not exist                |
| 409  | Conflict — duplicate email                                    |
| 500  | Internal Server Error                                         |

---

## Sample Requests

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"John","lastname":"Doe","email":"john@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Create a blog (auth required)

```bash
curl -X POST http://localhost:3000/api/blogs/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"blogTitle":"Intro to API Testing","blog":"...","category":"Testing"}'
```

### Search / filter (public)

```bash
# partial-title match
curl "http://localhost:3000/api/blogs?title=playwright"

# exact category
curl "http://localhost:3000/api/blogs?category=Testing"

# combined
curl "http://localhost:3000/api/blogs?title=playwright&category=Testing"
```

---

## Postman

A complete Postman collection covering all 13 endpoints is included at:

```
postman/Blog-API.postman_collection.json
```

1. Open Postman → **Import** → select the JSON file.
2. The collection defines two variables:
   - `baseUrl` (defaults to `http://localhost:3000`)
   - `token` (auto-populated by the Login requests' test scripts)
3. Hit **Login (Admin)** or **Login (User)** first; the response token is saved to `{{token}}` and reused by every protected request.

### API Documentation

A rendered version of the API documentation is published at:

> **https://documenter.getpostman.com/view/YOUR-COLLECTION-ID**

> To generate your own published docs:
> 1. In Postman, click the collection → **Publish Docs**.
> 2. Copy the public URL.
> 3. Replace the link above.

---

## Smoke Test

A reproducible end-to-end test is included:

```bash
npm start        # in one terminal
npm run smoke    # in another
```

It exercises auth, registration, validation, blog CRUD, ownership rules, and the search/filter endpoints.

---

## Security Notes

- All passwords are hashed with bcrypt (10 rounds) before storage — they are never returned by any endpoint.
- Passwords are stripped from every user-shaped response via `User.toSafeJSON()`.
- Protected endpoints require a valid JWT; deactivated users are blocked at the auth middleware (403).
- Inputs are validated with Joi at the middleware layer; role / isActive are explicitly `Joi.forbidden()` on user-facing payloads so callers can't escalate themselves.
- Route order matters: static routes (`/profile`, `/password`, `/create`, `/update/:id`, `/delete/:id`) are declared **before** any `/:id` param route to avoid shadowing.

---

## License

ISC
