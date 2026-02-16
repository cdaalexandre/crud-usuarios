# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack CRUD application with React 19 + TypeScript frontend and Node.js + Express + SQLite backend. The application manages user data with complete Create, Read, Update, and Delete operations.

## Development Commands

### Running the Application
**IMPORTANT**: You need to run both backend and frontend for the app to work properly.

#### Option 1: Run both simultaneously (recommended)
```bash
npm run dev:all
```
This starts both the backend API server (port 3000) and frontend dev server (port 5173) concurrently.

#### Option 2: Run separately (for debugging)
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

### Other Commands
- `npm install` - Install all dependencies (run this first after cloning)
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

### Servers
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **API Endpoints**: http://localhost:3000/api/users

## Architecture

### Tech Stack

**Frontend:**
- **React 19** - UI library with hooks
- **TypeScript 5.6** - Type-safe JavaScript
- **Vite 6** - Build tool and dev server with instant HMR
- **ESLint 9** - Code linting

**Backend:**
- **Node.js** - JavaScript runtime
- **Express** - Web framework for API routes
- **SQLite (sqlite3)** - Embedded database
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Auto-restart server on file changes (dev)

### Project Structure
```
├── src/                      # Frontend React app
│   ├── components/
│   │   ├── UserForm.tsx      # Form for create/edit users
│   │   ├── UserForm.css
│   │   ├── UserList.tsx      # Table displaying users
│   │   └── UserList.css
│   ├── services/
│   │   └── api.ts            # API client for backend calls
│   ├── types.ts              # TypeScript type definitions
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Main app component with CRUD logic
│   ├── App.css
│   └── index.css             # Global styles
│
├── server/                   # Backend API
│   ├── routes/
│   │   └── users.js          # CRUD routes for users
│   ├── database.js           # SQLite database setup
│   ├── index.js              # Express server entry point
│   ├── users.db              # SQLite database file (auto-created)
│   └── package.json          # ES modules configuration
```

### Data Flow
1. **Frontend** makes HTTP requests to backend API
2. **Backend** processes requests and interacts with SQLite database
3. **Database** stores user data persistently
4. **Backend** returns JSON responses to frontend
5. **Frontend** updates UI with received data

### Configuration Files
- `vite.config.ts` - Vite configuration with React plugin
- `tsconfig.json` - TypeScript config for source code (strict mode enabled)
- `tsconfig.node.json` - TypeScript config for build tools (vite.config.ts)
- `eslint.config.js` - ESLint 9 flat config with React Hooks rules
- `index.html` - HTML entry point (Vite serves and injects scripts here)

### Key Patterns

**Frontend:**
- **React Functional Components** with hooks (useState, useEffect)
- **TypeScript Strict Mode** for type safety
- **Component-level CSS** files imported directly
- **Async/Await** for API calls
- **Error handling** with try/catch and user feedback

**Backend:**
- **RESTful API** design with proper HTTP methods
- **Express middleware** (cors, json parser)
- **Prepared statements** for SQL queries (security + performance)
- **Error handling** with appropriate HTTP status codes
- **ES Modules** (import/export instead of require)

### API Endpoints
All endpoints are prefixed with `/api/users`:

- `GET /api/users` - List all users
- `GET /api/users/:id` - Get single user by ID
- `POST /api/users` - Create new user (requires: nome, email; optional: telefone)
- `PUT /api/users/:id` - Update user (requires: nome, email; optional: telefone)
- `DELETE /api/users/:id` - Delete user

### Database Schema
```sql
users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Adding New Features

### Adding a New API Endpoint
1. Add route in `server/routes/users.js` or create new route file
2. Import and use in `server/index.js` with `app.use()`
3. Update frontend API client in `src/services/api.ts`
4. Add TypeScript types in `src/types.ts` if needed

### Adding a New Component
1. Create `ComponentName.tsx` in `src/components/`
2. Create corresponding `ComponentName.css` for styles
3. Import and use in parent component
4. Define prop types interface

### Adding Database Fields
1. Modify table schema in `server/database.js`
2. Delete `server/users.db` to recreate database
3. Update TypeScript types in `src/types.ts`
4. Update API routes to handle new fields
5. Update frontend components/forms

### Adding Dependencies
```bash
npm install package-name           # Runtime dependency
npm install -D package-name        # Development dependency
```

## Code Quality

### Linting Rules
- React Hooks rules enforced (proper dependency arrays, rules of hooks)
- React Refresh rules (components must export properly for HMR)
- TypeScript ESLint recommended rules
- No unused variables, parameters, or imports

### Type Safety
- All components should have proper TypeScript types
- Avoid `any` type unless absolutely necessary
- Props interfaces should be defined for all components
- Use TypeScript's utility types (Partial, Pick, Omit, etc.) when appropriate

### Security Considerations
- SQL injection prevented by using prepared statements
- Email uniqueness enforced at database level
- Input validation on both frontend and backend
- CORS enabled for cross-origin requests
- Error messages don't expose sensitive information

## Credenciais e Configurações

### Arquivo de Credenciais
As credenciais sensíveis estão armazenadas localmente em `.credentials` (não versionado no Git).

Para acessar:
```bash
cat .credentials
```

**Contém:**
- Token da API do Render
- IDs de serviços
- URLs de produção
- Links úteis

**IMPORTANTE:** Nunca commite este arquivo. Ele está no `.gitignore`.

### Informações de Deploy

**Frontend (GitHub Pages):**
- URL: https://cdaalexandre.github.io/crud-usuarios/
- Deploy automático via GitHub Actions
- Configuração: `.github/workflows/deploy.yml`

**Backend (Render.com):**
- URL: https://crud-usuarios-api-65jm.onrender.com
- Dashboard: https://dashboard.render.com/web/srv-d697eb248b3s73b0nqvg
- Deploy automático ao fazer push na branch master
- Configuração: `render.yaml`

**Repositório:**
- GitHub: https://github.com/cdaalexandre/crud-usuarios
- Owner: cdaalexandre

## Troubleshooting

### Backend not connecting
- Verify backend is running on port 3000
- Check `server/users.db` exists (auto-created on first run)
- Look for port conflicts

### Frontend errors
- Ensure backend is running first
- Check browser console for API errors
- Verify API_URL in `src/services/api.ts` matches backend

### Database issues
- Delete `server/users.db` to reset database
- Restart backend server to recreate with sample data
