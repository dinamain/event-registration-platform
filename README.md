# Event Registration Platform

A full-stack event registration platform where users can register, log in, browse events, register for events, and view their registrations.

## Live Links

- **Frontend (Live App)**: https://event-registration-platform-rho.vercel.app/
- **Backend API**: https://event-registration-platform-qun4.onrender.com
- **GitHub Repository**: https://github.com/dinamain/event-registration-platform

> Note: The backend is hosted on Render's free tier. The first request after inactivity may take 30–50 seconds to respond while the server wakes up.

## Tech Stack

- **Frontend**: React.js (Vite), React Router, Axios
- **Backend**: Django, Django REST Framework
- **Database**: SQLite (development & demo deployment)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Deployment**: Render (backend), Vercel (frontend)

## Features

- User registration and login with hashed passwords
- JWT-based authentication with automatic token refresh
- Browse all events (title, description, date, location)
- View individual event details
- Register for an event (duplicate registration prevented at both API and database level)
- View "My Registrations" — all events a user has registered for
- Responsive UI with loading and error states

---

## Project Structure

```
event_platform/
├── accounts/          # Custom user model, auth serializers/views
├── events/            # Event & Registration models, serializers/views
├── config/            # Django project settings & URLs
├── frontend/          # React (Vite) application
├── requirements.txt
├── build.sh           # Render build script
└── manage.py
```

---

## Local Setup
## Running with Celery (Async Email)

Event registration emails are sent asynchronously via Celery. To enable this locally:

1. Run Redis (e.g. via Docker): `docker run -d -p 6379:6379 --name redis-local redis`
2. Start a Celery worker in a separate terminal: `celery -A config worker --loglevel=info -P solo`

Without a running worker, registration still succeeds, but the email task will queue in Redis until a worker is available to process it.
### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/dinamain/event-registration-platform.git
   cd event-registration-platform
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. (Optional) Create a superuser to access Django admin:
   ```bash
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://127.0.0.1:8000/api/`.

## Running with Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api


### Database Setup

By default, the project uses **SQLite** — no additional setup required. The database file (`db.sqlite3`) is created automatically when you run migrations.

For production, the project supports PostgreSQL via `DATABASE_URL` (using `dj-database-url`). If `DATABASE_URL` is not set, it falls back to SQLite automatically.

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend/` folder:
   ```
   VITE_API_URL=http://127.0.0.1:8000/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

---

## Environment Variables
### Backend (`config/settings.py`, via `.env` or hosting environment)

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django secret key | (dev fallback included) |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `127.0.0.1,localhost` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173,http://localhost:5174` |
| `DATABASE_URL` | PostgreSQL connection string (optional) | falls back to SQLite |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used by seed command to create a superuser on deploy | none |
| `EMAIL_HOST_USER` | Gmail address used to send registration confirmation emails | none |
| `EMAIL_HOST_PASSWORD` | Gmail App Password for SMTP authentication | none |
| `GROQ_API_KEY` | API key for Groq (LLM API used for AI-generated event descriptions) | none |

| `CELERY_BROKER_URL` | Redis connection string used by Celery for async tasks | `redis://localhost:6379/0` |
### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (e.g. `http://127.0.0.1:8000/api`) |

## API Documentation

Base URL (local): `http://127.0.0.1:8000/api`
Base URL (live): `https://event-registration-platform-qun4.onrender.com/api`

### Authentication

#### Register
```
POST /api/register
```
Request body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPassword123!"
}
```
Response (201):
```json
{
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com" },
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>"
}
```

#### Login
```
POST /api/login
```
Request body:
```json
{
  "email": "jane@example.com",
  "password": "StrongPassword123!"
}
```
Response (200): same shape as register.

Errors (400):
```json
{ "non_field_errors": ["Invalid email or password"] }
```

#### Refresh Token
```
POST /api/token/refresh/
```
Request body:
```json
{ "refresh": "<jwt_refresh_token>" }
```
Response (200):
```json
{ "access": "<new_jwt_access_token>" }
```

---

### Events

#### List All Events
```
GET /api/events
```
No authentication required.

Response (200):
```json
[
  {
    "id": 1,
    "title": "AI Era",
    "description": "Conducted by Google",
    "date": "2026-06-24T12:00:00Z",
    "location": "Thiruvananthapuram",
    "created_at": "2026-06-14T05:10:39.774277Z"
  }
]
```

#### Get Event Detail
```
GET /api/events/:id
```
No authentication required.

Response (200): single event object (same shape as above).

---

### Registrations

#### Register for an Event
```
POST /api/events/:id/register
```
**Requires authentication** (`Authorization: Bearer <access_token>`).

Response (201):
```json
{
  "id": 1,
  "event": { "id": 1, "title": "AI Era", "description": "...", "date": "...", "location": "...", "created_at": "..." },
  "registered_at": "2026-06-14T06:00:00Z"
}
```

Errors:
- `400` if already registered: `{ "detail": "Already registered for this event" }`
- `404` if event not found: `{ "detail": "Event not found" }`
- `401` if not authenticated

#### Get My Registrations
```
GET /api/my-registrations
```
**Requires authentication** (`Authorization: Bearer <access_token>`).

Response (200):
```json
[
  {
    "id": 1,
    "event": { "id": 1, "title": "AI Era", "description": "...", "date": "...", "location": "...", "created_at": "..." },
    "registered_at": "2026-06-14T06:00:00Z"
  }
]
```

---

## Authentication Flow

1. User registers via `/api/register` → receives `access` and `refresh` JWT tokens.
2. User must then log in via `/api/login` to obtain fresh tokens (registration does not auto-login).
3. The frontend stores tokens in `localStorage` and attaches `access` as a `Bearer` token to all authenticated requests via an Axios interceptor.
4. If a request returns `401` due to an expired access token, the frontend automatically calls `/api/token/refresh/` using the stored refresh token, obtains a new access token, and retries the original request.
5. If the refresh token is also invalid/expired, the user is logged out and redirected to `/login`.

---

## Database Structure

**Users** (`accounts.User` — custom user model, email-based login)
- `id`, `name`, `email` (unique), `password` (hashed), `created_at`

**Events** (`events.Event`)
- `id`, `title`, `description`, `date`, `location`, `created_at`

**Registrations** (`events.Registration`)
- `id`, `user_id` (FK), `event_id` (FK), `registered_at`
- Unique constraint on `(user, event)` — prevents duplicate registrations at the database level

---

## Notes on Deployment

- Backend deployed on Render (free tier) using `gunicorn` and `whitenoise` for static files.
- A custom management command (`seed_data`) seeds sample events and an admin user on deploy via `build.sh`.
- Frontend deployed on Vercel, with `VITE_API_URL` pointing to the live Render backend.
- CORS is configured via `CORS_ALLOWED_ORIGINS` to allow the deployed frontend origin.

> Note: The free Render tier uses an ephemeral filesystem, so SQLite data may reset on redeploys. In a production setup, PostgreSQL (via `DATABASE_URL`) would be used for persistent storage.

## Interactive API Docs

Swagger UI: `/api/docs/`
OpenAPI schema: `/api/schema/`

## Running Tests

```bash
pytest -v
```

12 tests covering authentication, event registration (including duplicate-prevention), and admin permission boundaries.


## Deploying to Azure (App Service)

This project's Docker setup is directly compatible with Azure App Service's "Web App for Containers" feature. Steps to deploy:

1. **Create an Azure Container Registry (ACR)** to store the Docker image:
```bash
   az acr create --resource-group myResourceGroup --name myRegistry --sku Basic
```

2. **Build and push the backend image to ACR**:
```bash
   az acr build --registry myRegistry --image event-platform-backend:latest .
```

3. **Create an App Service plan and Web App for Containers**:
```bash
   az appservice plan create --name myAppPlan --resource-group myResourceGroup --is-linux --sku B1
   az webapp create --resource-group myResourceGroup --plan myAppPlan --name event-platform-api --deploy-container-image-name myRegistry.azurecr.io/event-platform-backend:latest
```

4. **Configure environment variables** (App Service > Configuration > Application settings):
   - `SECRET_KEY`
   - `DEBUG=False`
   - `ALLOWED_HOSTS=event-platform-api.azurewebsites.net`
   - `CORS_ALLOWED_ORIGINS=<frontend-url>`
   - `DATABASE_URL` (if using Azure Database for PostgreSQL)

5. **(Optional) Azure Database for PostgreSQL** — create a managed Postgres instance and set its connection string as `DATABASE_URL`; the project's `dj-database-url` configuration picks this up automatically without code changes.

6. **(Optional) Azure Key Vault** — for production, secrets like `SECRET_KEY` and `DATABASE_URL` would be stored in Key Vault and referenced via App Service's Key Vault references, rather than as plain Application Settings.

This project currently runs on Render + Vercel for the live demo; the steps above reflect how the same Dockerized backend would be deployed in an Azure-based enterprise environment.

## AI Features

- **AI-generated event descriptions**: In the admin dashboard, staff can click "Generate with AI" after entering an event title (and optional location) to auto-generate a polished description using Groq's API (Llama 3.3 70B). The generated text can be edited before saving.