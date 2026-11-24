# Session Authentication — Full Stack

This package combines your existing Spring Boot session-authentication backend with a React + Vite frontend.

## Project structure

```text
session-authentication-fullstack/
├── backend/                 # Your original Spring Boot project
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   └── src/
├── frontend/                # React + Vite application
│   ├── package.json
│   ├── vite.config.js
│   └── src/
└── README.md
```

## Requirements

- Java 21
- MySQL
- Node.js (with npm)
- IntelliJ IDEA (backend) and VS Code or IntelliJ (frontend)

## 1. Configure MySQL

Start MySQL and run:

```sql
CREATE DATABASE authentication_db;
```

Set your MySQL password as the `DB_PASSWORD` environment variable. The backend's existing `application.properties` uses this variable; do not put your real password in Git.

PowerShell example for the current terminal:

```powershell
$env:DB_PASSWORD = "your_mysql_password"
```

## 2. Run the backend

Open `backend` in IntelliJ IDEA, or run from PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend URL: `http://localhost:8080`

The backend source code and security configuration are the original files from your GitHub repository. The existing CORS configuration permits `http://localhost:5173`.

## 3. Run the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

If you need a different backend URL, copy `frontend/.env.example` to `frontend/.env` and edit `VITE_API_BASE_URL`.

## 4. Test the application

1. Open the frontend and choose **Create account**.
2. Register with a name, valid email, and password of at least 8 characters.
3. Sign in using those credentials.
4. The dashboard displays the current authenticated user.
5. Refresh the dashboard. The browser sends the session cookie again and the backend checks `/api/auth/me`.
6. Log out. The backend invalidates the HTTP session and the frontend returns to the login page.

## How the browser and backend work together

- The frontend sends API requests with `credentials: "include"` so browser cookies are included.
- Before POST requests, the frontend calls `GET /api/auth/csrf` and sends the returned token in `X-XSRF-TOKEN`.
- After successful login, Spring Security stores the authenticated `SecurityContext` in the HTTP session.
- The browser keeps the session identifier cookie (`JSESSIONID`) and sends it with later API requests.
- The frontend does not store passwords or authentication tokens in local storage.

## API endpoints already implemented by the backend

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/auth/csrf` | Obtain CSRF token |
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Read current authenticated user |
| POST | `/api/auth/logout` | Invalidate session |

## Notes

- The frontend uses the existing backend response properties: `message`, `name`, and `email`.
- Signup creates the account; the user then signs in separately.
- The backend requires the MySQL database and `DB_PASSWORD` environment variable to be configured before startup.
- Dependencies are declared in `package.json`; run `npm install` on your machine to download them.
