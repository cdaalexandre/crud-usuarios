# NOTES.md - Histórico Completo do Projeto

Este documento descreve detalhadamente todo o processo de criação deste projeto, desde o repositório vazio até o deploy em produção.

---

## 📋 Índice
1. [Contexto Inicial](#contexto-inicial)
2. [Inicialização do Projeto](#inicialização-do-projeto)
3. [Criação do Backend](#criação-do-backend)
4. [Criação do Frontend](#criação-do-frontend)
5. [Configuração do Git e GitHub](#configuração-do-git-e-github)
6. [Deploy em Produção](#deploy-em-produção)
7. [Segurança e Credenciais](#segurança-e-credenciais)
8. [Conceitos Importantes](#conceitos-importantes)

---

## 1. Contexto Inicial

### 1.1 Situação de Partida
- **Repositório vazio** em `C:\repo\axClaudeCode`
- **Objetivo**: Criar um CRUD (Create, Read, Update, Delete) de usuários
- **Requisitos do usuário**:
  - Interface em português
  - CRUD completo e funcional
  - Banco de dados SQLite (um banco de dados leve que não precisa de servidor separado)
  - Deploy público (acessível via internet)

### 1.2 Decisões Arquiteturais Iniciais

**Escolha do Stack (conjunto de tecnologias):**
- **Frontend**: React + TypeScript + Vite
  - **React**: Biblioteca JavaScript para construir interfaces de usuário
  - **TypeScript**: JavaScript com tipagem estática (previne muitos erros)
  - **Vite**: Build tool (ferramenta de compilação) moderna e rápida

- **Backend**: Node.js + Express + SQLite
  - **Node.js**: Runtime (ambiente de execução) JavaScript no servidor
  - **Express**: Framework (estrutura) web minimalista para Node.js
  - **SQLite**: Banco de dados relacional embutido (não precisa de servidor)

---

## 2. Inicialização do Projeto

### 2.1 Criação da Estrutura Base

**Passo 1: Criação manual dos arquivos**
- Tentamos usar `npm create vite` (comando oficial do Vite)
- A criação interativa foi cancelada (requer input do usuário)
- **Solução**: Criar todos os arquivos manualmente

**Arquivos criados:**

#### `package.json` (Manifesto do projeto)
Define as dependências (bibliotecas necessárias) e scripts (comandos) do projeto:
```json
{
  "name": "axclaudecode",
  "scripts": {
    "dev": "vite",              // Inicia servidor de desenvolvimento
    "build": "tsc -b && vite build",  // Compila para produção
    "lint": "eslint .",         // Verifica qualidade do código
    "preview": "vite preview"   // Prévia da build de produção
  }
}
```

**Dependências instaladas:**
- **Produção** (vão para a aplicação final):
  - `react`, `react-dom`: Biblioteca React
  - `express`: Framework web
  - `cors`: Permite requisições cross-origin (frontend → backend)
  - `sqlite3`: Driver do banco de dados

- **Desenvolvimento** (apenas para programar):
  - `vite`: Build tool
  - `typescript`: Compilador TypeScript
  - `eslint`: Linter (verificador de código)
  - `concurrently`: Executa múltiplos comandos simultaneamente
  - `nodemon`: Reinicia servidor quando código muda

#### `tsconfig.json` (Configuração do TypeScript)
Define como o TypeScript compila o código:
- **Modo strict**: Verificações de tipo rigorosas
- **Module resolution bundler**: Resolução de módulos moderna
- **JSX react-jsx**: Suporte ao React sem importar React em todo arquivo

#### `vite.config.ts` (Configuração do Vite)
- Plugin do React habilitado
- Base path `/crud-usuarios/` (necessário para GitHub Pages)

#### Estrutura de pastas inicial:
```
src/
├── main.tsx          // Entry point (ponto de entrada) da aplicação
├── App.tsx           // Componente raiz
├── App.css           // Estilos do App
├── index.css         // Estilos globais
└── vite-env.d.ts     // Declarações de tipo do Vite

public/
└── vite.svg          // Logo do Vite

index.html            // HTML base (Vite injeta scripts aqui)
```

### 2.2 Instalação das Dependências

**Primeiro problema encontrado:**
- `better-sqlite3` (biblioteca SQLite síncrona) falhou ao compilar
- **Erro**: Incompatibilidade C++20 vs C++17 com Node.js 24.13.1
- **Causa**: Bibliotecas nativas precisam ser compiladas para a versão específica do Node

**Solução aplicada:**
- Substituir `better-sqlite3` por `sqlite3` (versão assíncrona, mais compatível)
- `sqlite3` tem builds pré-compilados melhores

**Comando executado:**
```bash
npm install express cors sqlite3 concurrently nodemon
```

**Resultado:**
- 401 pacotes instalados com sucesso
- 5 vulnerabilidades high (comum em projetos npm, geralmente em dependências transitivas)

---

## 3. Criação do Backend

### 3.1 Estrutura do Backend

**Arquitetura em camadas:**
```
server/
├── database.js       // Configuração e inicialização do banco
├── routes/users.js   // Rotas CRUD (endpoints da API)
├── index.js          // Entry point do servidor Express
└── package.json      // Configuração ES modules
```

### 3.2 Banco de Dados (`server/database.js`)

**Funcionalidades implementadas:**

1. **Criação da conexão SQLite**
```javascript
const db = new sqlite3.Database(join(__dirname, 'users.db'));
```
- Cria arquivo `users.db` se não existir
- Banco de dados baseado em arquivo (não precisa de servidor)

2. **Helper para Promisify**
```javascript
const promisify = (fn) => { /* ... */ }
db.runAsync = promisify(db.run);
db.getAsync = promisify(db.get);
db.allAsync = promisify(db.all);
```
- **Promisify**: Converte callbacks (estilo antigo) em Promises (estilo moderno)
- Permite usar `async/await` (sintaxe mais limpa)

3. **Schema da tabela** (estrutura de dados)
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```
- **PRIMARY KEY**: Identificador único
- **AUTOINCREMENT**: Incrementa automaticamente (1, 2, 3...)
- **NOT NULL**: Campo obrigatório
- **UNIQUE**: Não permite emails duplicados
- **DEFAULT**: Valor padrão se não fornecido

4. **Dados de exemplo** (seed data)
- 3 usuários inseridos automaticamente na primeira execução
- Verifica com `COUNT(*)` para não duplicar

### 3.3 Rotas da API (`server/routes/users.js`)

**Endpoints implementados:**

#### `GET /api/users` - Listar todos
```javascript
router.get('/', async (req, res) => {
  const users = await db.allAsync('SELECT * FROM users ORDER BY created_at DESC');
  res.json(users);
});
```
- **Async/await**: Espera resultado do banco antes de responder
- **ORDER BY created_at DESC**: Mais recentes primeiro

#### `GET /api/users/:id` - Buscar por ID
```javascript
router.get('/:id', async (req, res) => {
  const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(user);
});
```
- **:id**: Route parameter (parâmetro dinâmico na URL)
- **Status 404**: Not Found (recurso não existe)
- **Prepared statement** (`?`): Previne SQL injection

#### `POST /api/users` - Criar novo
```javascript
router.post('/', async (req, res) => {
  const { nome, email, telefone } = req.body;
  // Validação
  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }
  // Inserção
  const result = await db.runAsync(
    'INSERT INTO users (nome, email, telefone) VALUES (?, ?, ?)',
    [nome, email, telefone || null]
  );
  // Retorna usuário criado
  const newUser = await db.getAsync('SELECT * FROM users WHERE id = ?', [result.lastID]);
  res.status(201).json(newUser);
});
```
- **req.body**: Corpo da requisição (dados enviados pelo cliente)
- **Destructuring**: `{ nome, email, telefone }` extrai campos do objeto
- **Status 201**: Created (recurso criado com sucesso)
- **Status 400**: Bad Request (dados inválidos)
- **lastID**: ID do registro recém-inserido

#### `PUT /api/users/:id` - Atualizar
```javascript
router.put('/:id', async (req, res) => {
  const { nome, email, telefone } = req.body;
  const result = await db.runAsync(
    'UPDATE users SET nome = ?, email = ?, telefone = ? WHERE id = ?',
    [nome, email, telefone || null, req.params.id]
  );
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  const updatedUser = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
  res.json(updatedUser);
});
```
- **result.changes**: Quantidade de linhas afetadas
- Se 0, usuário não existe (retorna 404)

#### `DELETE /api/users/:id` - Deletar
```javascript
router.delete('/:id', async (req, res) => {
  const result = await db.runAsync('DELETE FROM users WHERE id = ?', [req.params.id]);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  res.json({ message: 'Usuário deletado com sucesso' });
});
```

**Tratamento de erros:**
- Try/catch em todas as rotas
- Erros de constraint (UNIQUE) tratados especificamente
- Mensagens de erro em português

### 3.4 Servidor Express (`server/index.js`)

```javascript
import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';

const app = express();
const PORT = 3000;

// Middleware (funções que processam requisições)
app.use(cors());              // Permite requisições de outras origens
app.use(express.json());      // Parse de JSON no body

// Rotas
app.use('/api/users', usersRouter);

// Health check (verificação se servidor está vivo)
app.get('/', (req, res) => {
  res.json({ message: 'API CRUD de Usuários - Funcionando! 🚀' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
```

**Conceitos:**
- **Middleware**: Funções que interceptam e processam requisições
- **CORS** (Cross-Origin Resource Sharing): Permite frontend (porta 5173) acessar backend (porta 3000)
- **express.json()**: Converte JSON do body em objeto JavaScript

---

## 4. Criação do Frontend

### 4.1 Estrutura do Frontend

```
src/
├── components/
│   ├── UserForm.tsx      // Formulário modal para criar/editar
│   ├── UserForm.css
│   ├── UserList.tsx      // Tabela com lista de usuários
│   └── UserList.css
├── services/
│   └── api.ts            // Cliente HTTP (abstração das chamadas à API)
├── types.ts              // Definições de tipos TypeScript
├── App.tsx               // Componente principal (orquestra tudo)
└── main.tsx              // Entry point
```

### 4.2 Definição de Tipos (`src/types.ts`)

```typescript
export interface User {
  id?: number;           // Optional porque não existe ao criar
  nome: string;
  email: string;
  telefone?: string;     // Optional porque não é obrigatório
  created_at?: string;   // Gerado pelo banco
}
```

**Benefícios do TypeScript:**
- Autocompletar no editor
- Detecta erros em tempo de desenvolvimento
- Documentação automática

### 4.3 Cliente da API (`src/services/api.ts`)

**Abstração das chamadas HTTP:**

```typescript
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/users`
  : 'http://localhost:3000/api/users';
```
- **Environment variable**: URL diferente para dev vs produção
- **import.meta.env.VITE_API_URL**: Variável de ambiente do Vite
- **Fallback**: Se não definida, usa localhost

**Funções CRUD:**

```typescript
export const api = {
  async getUsers(): Promise<User[]> {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao buscar usuários');
    return response.json();
  },

  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar usuário');
    }
    return response.json();
  },

  // ... updateUser, deleteUser
};
```

**Conceitos:**
- **Omit<User, 'id' | 'created_at'>**: Tipo User sem os campos id e created_at
- **fetch()**: API nativa do browser para requisições HTTP
- **async/await**: Sintaxe para lidar com operações assíncronas
- **JSON.stringify()**: Converte objeto JavaScript em string JSON

### 4.4 Componente UserList (`src/components/UserList.tsx`)

**Responsabilidades:**
- Exibir tabela de usuários
- Botões de ação (Editar, Deletar)
- Confirmação antes de deletar

```typescript
interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  const handleDelete = (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja deletar ${nome}?`)) {
      onDelete(id);
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Email</th>
          <th>Telefone</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.nome}</td>
            <td>{user.email}</td>
            <td>{user.telefone || '-'}</td>
            <td>
              <button onClick={() => onEdit(user)}>Editar</button>
              <button onClick={() => handleDelete(user.id!, user.nome)}>
                Deletar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Conceitos React:**
- **Props**: Dados passados do componente pai
- **map()**: Itera array e cria elemento para cada item
- **key**: Identificador único para React otimizar re-renders
- **Callback props** (`onEdit`, `onDelete`): Funções passadas como props
- **Optional chaining** (`user.telefone || '-'`): Se null/undefined, usa '-'

### 4.5 Componente UserForm (`src/components/UserForm.tsx`)

**Responsabilidades:**
- Modal (overlay) para criar/editar usuário
- Validação de campos obrigatórios
- Estado local do formulário

```typescript
interface UserFormProps {
  user?: User | null;     // Se presente, modo edição; se null, modo criação
  onSubmit: (user: Omit<User, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  // Preencher campos ao editar
  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setTelefone(user.telefone || '');
    } else {
      setNome('');
      setEmail('');
      setTelefone('');
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();  // Previne reload da página
    onSubmit({ nome, email, telefone: telefone || undefined });
  };

  return (
    <div className="user-form-overlay">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        {/* ... outros campos */}
        <button type="submit">{user ? 'Atualizar' : 'Criar'}</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </form>
    </div>
  );
}
```

**Conceitos React:**
- **useState**: Hook para estado local do componente
- **useEffect**: Hook para side effects (efeitos colaterais)
- **Controlled components**: Input controlado pelo estado React
- **Event handlers** (`onChange`, `onSubmit`): Funções que respondem a eventos
- **Conditional rendering** (`user ? 'Atualizar' : 'Criar'`): Renderização condicional

### 4.6 Componente App (`src/App.tsx`)

**Orquestrador principal:**

```typescript
function App() {
  // Estado global da aplicação
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Carregar usuários ao montar componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (userData: Omit<User, 'id' | 'created_at'>) => {
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id!, userData);
      } else {
        await api.createUser(userData);
      }
      await loadUsers();  // Recarrega lista
      setShowForm(false);
      setEditingUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  // ... handleDelete, handleEdit, handleCancel

  return (
    <div className="app">
      <header>
        <h1>📋 CRUD de Usuários</h1>
      </header>

      <main>
        <button onClick={() => setShowForm(true)}>+ Novo Usuário</button>

        {loading ? (
          <div>Carregando...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </main>

      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
```

**Padrões aplicados:**
- **Lifting state up**: Estado compartilhado no componente pai
- **Error handling**: Try/catch para operações assíncronas
- **Loading states**: Feedback visual durante operações
- **Optimistic updates**: Poderia ser implementado (atualizar UI antes da API responder)

---

## 5. Configuração do Git e GitHub

### 5.1 Instalação do GitHub CLI

**Problema inicial:**
- `gh` (GitHub CLI) não estava instalado

**Solução:**
```bash
winget install --id GitHub.cli
```
- **winget**: Gerenciador de pacotes do Windows
- Instalou versão 2.86.0 do GitHub CLI

### 5.2 Autenticação no GitHub

**Device Flow Authentication:**
```bash
gh auth login
```

**Fluxo:**
1. CLI gera código: `D456-61EB`
2. Usuário acessa: https://github.com/login/device
3. Cola código e autoriza
4. CLI recebe token de acesso

**Resultado:**
```
✓ Authentication complete.
✓ Logged in as cdaalexandre
```

### 5.3 Inicialização do Git

```bash
git init
git add .
git commit -m "Initial commit: CRUD de Usuários..."
```

**Arquivos commitados:**
- 27 arquivos
- 7185 linhas inseridas
- Inclui: código-fonte, configurações, dependências (package-lock.json)

**Nota sobre line endings:**
- Warnings sobre LF → CRLF
- **LF** (Line Feed): Unix/Mac (\n)
- **CRLF** (Carriage Return + Line Feed): Windows (\r\n)
- Git converte automaticamente no Windows

### 5.4 Criação do Repositório no GitHub

```bash
gh repo create crud-usuarios \
  --public \
  --source=. \
  --remote=origin \
  --description="CRUD de Usuários com React + TypeScript + Node.js + SQLite" \
  --push
```

**Flags explicadas:**
- `--public`: Repositório público (visível para todos)
- `--source=.`: Usa diretório atual como fonte
- `--remote=origin`: Adiciona remote chamado "origin"
- `--push`: Faz push automático após criar

**Resultado:**
- URL: https://github.com/cdaalexandre/crud-usuarios
- Branch master configurada com tracking

---

## 6. Deploy em Produção

### 6.1 Estratégia de Deploy

**Decisão arquitetural:**
- **Frontend**: GitHub Pages (gratuito, serve apenas arquivos estáticos)
- **Backend**: Render.com (gratuito, executa Node.js)

**Por que não tudo no GitHub Pages?**
- GitHub Pages não executa código backend
- Apenas serve HTML, CSS, JavaScript estáticos

### 6.2 Configuração do GitHub Pages

**Criação via API:**
```bash
gh api repos/cdaalexandre/crud-usuarios/pages \
  -X POST \
  -f "build_type=workflow"
```

**Parâmetros:**
- `build_type=workflow`: Usa GitHub Actions (não gh-pages branch)
- Alternativa seria branch `gh-pages` com HTML pré-compilado

**Resultado:**
```json
{
  "url": "https://api.github.com/repos/cdaalexandre/crud-usuarios/pages",
  "html_url": "https://cdaalexandre.github.io/crud-usuarios/",
  "build_type": "workflow",
  "https_enforced": true
}
```

### 6.3 GitHub Actions Workflow

**Arquivo:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]  # Dispara ao fazer push na master
  workflow_dispatch:      # Permite disparo manual

permissions:
  contents: read          # Ler código
  pages: write           # Escrever no GitHub Pages
  id-token: write        # Necessário para deploy

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: https://crud-usuarios-api-65jm.onrender.com

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build          # Depende do job build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Conceitos GitHub Actions:**
- **Workflow**: Processo automatizado
- **Job**: Conjunto de steps que rodam no mesmo runner
- **Step**: Comando individual ou action
- **Action**: Código reutilizável da comunidade
- **Runner**: Máquina virtual que executa o workflow
- **Artifact**: Arquivo gerado que pode ser passado entre jobs
- **Environment**: Ambiente de deploy com proteções

**Fluxo de execução:**
1. Push na master dispara workflow
2. Job `build`:
   - Instala Node.js 20
   - Instala dependências
   - Compila código (`npm run build`)
   - Gera pasta `dist/` com arquivos estáticos
   - Upload do artifact
3. Job `deploy`:
   - Aguarda `build` completar
   - Faz deploy do artifact no GitHub Pages

### 6.4 Configuração do Vite para GitHub Pages

**Problema:**
- GitHub Pages serve em `username.github.io/repo-name/`
- Não em `username.github.io/`

**Solução:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/crud-usuarios/',  // Base path para assets
})
```

**Impacto:**
- Todos os assets (JS, CSS, imagens) terão prefixo `/crud-usuarios/`
- Exemplo: `/crud-usuarios/assets/index-abc123.js`

### 6.5 Deploy do Backend no Render

**Autenticação via API:**

1. **Obter owner ID:**
```bash
curl https://api.render.com/v1/owners \
  -H "Authorization: Bearer rnd_..."
```

Resposta:
```json
[{
  "owner": {
    "id": "tea-d697cph5pdvs738d4270",
    "email": "alexandre.calzetta@cs.unicid.edu.br",
    "type": "team"
  }
}]
```

2. **Criar serviço:**
```bash
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer rnd_..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "crud-usuarios-api",
    "ownerId": "tea-d697cph5pdvs738d4270",
    "repo": "https://github.com/cdaalexandre/crud-usuarios",
    "autoDeploy": "yes",
    "branch": "master",
    "buildCommand": "npm install",
    "startCommand": "npm run server:prod",
    "envVars": [
      { "key": "NODE_ENV", "value": "production" }
    ],
    "serviceDetails": {
      "env": "node",
      "plan": "free",
      "region": "oregon",
      "healthCheckPath": "/",
      "envSpecificDetails": {
        "buildCommand": "npm install",
        "startCommand": "npm run server:prod"
      }
    }
  }'
```

**Resposta:**
```json
{
  "service": {
    "id": "srv-d697eb248b3s73b0nqvg",
    "name": "crud-usuarios-api",
    "url": "https://crud-usuarios-api-65jm.onrender.com",
    "autoDeploy": "yes",
    "region": "oregon",
    "plan": "free"
  },
  "deployId": "dep-d697ebi48b3s73b0nr40"
}
```

**Status do deploy:**
```bash
curl https://api.render.com/v1/services/.../deploys/... \
  -H "Authorization: Bearer rnd_..."
```

Estados possíveis:
- `build_in_progress`: Compilando código
- `live`: Servidor rodando e acessível
- `failed`: Erro no build ou inicialização

### 6.6 Configuração render.yaml

**Arquivo de configuração para Render:**

```yaml
services:
  - type: web
    name: crud-usuarios-api
    env: node
    region: oregon
    plan: free
    buildCommand: npm install
    startCommand: npm run server:prod
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
```

**Campos explicados:**
- **type: web**: Serviço web (recebe requisições HTTP)
- **env: node**: Runtime Node.js
- **region: oregon**: Data center (mais barato/gratuito)
- **plan: free**: Plano gratuito (limitações de recursos)
- **buildCommand**: Comando executado ao fazer deploy
- **startCommand**: Comando para iniciar servidor
- **healthCheckPath**: Endpoint que Render pinga para verificar se está vivo
- **envVars**: Variáveis de ambiente

**Limitações do plano free:**
- 512 MB RAM
- Hibernação após 15 minutos sem uso
- Primeiro acesso após hibernação: ~30 segundos (cold start)
- 750 horas/mês (suficiente para um serviço)

### 6.7 Atualização da URL da API

**Problema:**
- Frontend estava configurado para `http://localhost:3000`
- Produção precisa usar `https://crud-usuarios-api-65jm.onrender.com`

**Solução - Variável de ambiente:**

```typescript
// src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/users`
  : 'http://localhost:3000/api/users';
```

**Como funciona:**
- **Desenvolvimento** (`npm run dev`):
  - `VITE_API_URL` não definida
  - Usa `http://localhost:3000/api/users`

- **Produção** (GitHub Actions):
  - Define `VITE_API_URL=https://crud-usuarios-api-65jm.onrender.com`
  - Usa `https://crud-usuarios-api-65jm.onrender.com/api/users`

**Atualização do workflow:**
```yaml
- name: Build
  run: npm run build
  env:
    VITE_API_URL: https://crud-usuarios-api-65jm.onrender.com
```

### 6.8 Teste Final

**Backend:**
```bash
$ curl https://crud-usuarios-api-65jm.onrender.com
{"message":"API CRUD de Usuários - Funcionando! 🚀"}

$ curl https://crud-usuarios-api-65jm.onrender.com/api/users
[{"id":1,"nome":"João Silva",...},...]
```

**Frontend:**
- URL: https://cdaalexandre.github.io/crud-usuarios/
- Carrega interface React
- Faz requisições para backend Render
- CRUD completo funcionando

---

## 7. Segurança e Credenciais

### 7.1 Problema de Segurança

**Risco:**
- Token da API do Render (`rnd_16VVD43h7FR5JGY1VwlNy9xT6c3y`) usado durante setup
- Se commitado no Git, fica público no GitHub
- Qualquer pessoa poderia usar o token para:
  - Criar/deletar serviços
  - Modificar configurações
  - Gerar custos

### 7.2 Solução Implementada

**1. Arquivo `.credentials` (local, não versionado)**

Criado em: `C:\repo\axClaudeCode\.credentials`

Conteúdo:
```
# CREDENCIAIS - NÃO COMMITAR NO GIT

## Render.com
RENDER_API_KEY=rnd_16VVD43h7FR5JGY1VwlNy9xT6c3y
RENDER_SERVICE_ID=srv-d697eb248b3s73b0nqvg
RENDER_OWNER_ID=tea-d697cph5pdvs738d4270

## URLs de Produção
FRONTEND_URL=https://cdaalexandre.github.io/crud-usuarios/
BACKEND_URL=https://crud-usuarios-api-65jm.onrender.com

## GitHub
REPO_URL=https://github.com/cdaalexandre/crud-usuarios
GITHUB_USERNAME=cdaalexandre
```

**2. Adicionar ao `.gitignore`**

```bash
echo ".credentials" >> .gitignore
```

**Efeito:**
- Git ignora o arquivo
- Nunca será commitado
- Não aparece em `git status`
- Não vai para o GitHub

**3. Documentar no CLAUDE.md**

```markdown
## Credenciais e Configurações

As credenciais sensíveis estão em `.credentials` (não versionado).

Para acessar:
```bash
cat .credentials
```

**IMPORTANTE:** Nunca commite este arquivo.
```

### 7.3 Boas Práticas de Segurança

**O que NÃO fazer:**
- ❌ Commitar tokens/senhas no Git
- ❌ Colocar credenciais em variáveis de ambiente do CI/CD público
- ❌ Compartilhar tokens em mensagens/emails

**O que fazer:**
- ✅ Usar `.gitignore` para arquivos sensíveis
- ✅ Usar serviços de secrets (GitHub Secrets, Render Environment Variables)
- ✅ Rotacionar tokens periodicamente
- ✅ Usar tokens com escopo mínimo necessário
- ✅ Revogar tokens quando não mais necessários

### 7.4 Configuração de Permissões do Claude Code

**Problema inicial:**
- Claude Code pedia autorização para cada comando Bash
- Interrompia o fluxo de trabalho

**Solução:**
```json
{
  "permissions": {
    "allow": [
      "Bash(*)"
    ]
  }
}
```

**Arquivo:** `.claude/settings.local.json`

**Efeito:**
- Permite todos os comandos Bash automaticamente
- Ainda pede permissão para operações destrutivas (git push, deletar arquivos)
- Balance entre produtividade e segurança

---

## 8. Conceitos Importantes

### 8.1 Arquitetura Frontend-Backend

**Separação de responsabilidades:**

```
┌─────────────┐         ┌─────────────┐         ┌──────────┐
│  Frontend   │ ──HTTP─→│   Backend   │ ──SQL─→│ Database │
│ (React)     │←──JSON──│  (Express)  │←───────│ (SQLite) │
│ Porta 5173  │         │  Porta 3000 │         │ Arquivo  │
└─────────────┘         └─────────────┘         └──────────┘
```

**Frontend:**
- Interface visual (UI)
- Lógica de apresentação
- Validação de formulários
- Gerenciamento de estado local

**Backend:**
- Lógica de negócio
- Validação de dados
- Autenticação/autorização (não implementado neste projeto)
- Acesso ao banco de dados

**Database:**
- Persistência de dados
- Queries e indexes
- Integridade referencial

### 8.2 REST API

**Princípios:**
- **RE**presentational **S**tate **T**ransfer
- Usa métodos HTTP semânticos
- Recursos identificados por URLs
- Stateless (sem estado entre requisições)

**Métodos HTTP (Verbos):**

| Método | Operação CRUD | Idempotente? | Descrição |
|--------|---------------|--------------|-----------|
| GET    | Read          | Sim          | Buscar recurso(s) |
| POST   | Create        | Não          | Criar novo recurso |
| PUT    | Update        | Sim          | Atualizar recurso completo |
| PATCH  | Update        | Não          | Atualizar recurso parcial |
| DELETE | Delete        | Sim          | Remover recurso |

**Idempotente:** Múltiplas requisições idênticas têm o mesmo efeito que uma única

**Códigos de status HTTP:**

| Código | Significado | Quando usar |
|--------|-------------|-------------|
| 200    | OK          | Sucesso geral |
| 201    | Created     | Recurso criado (POST) |
| 204    | No Content  | Sucesso sem resposta (DELETE) |
| 400    | Bad Request | Dados inválidos |
| 404    | Not Found   | Recurso não existe |
| 500    | Server Error| Erro no servidor |

### 8.3 SQL Injection e Prepared Statements

**SQL Injection (vulnerabilidade):**

```javascript
// INSEGURO - NÃO FAÇA ISSO
const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
db.run(query);
```

**Ataque:**
```
GET /api/users/1; DROP TABLE users; --
```

**Query executada:**
```sql
SELECT * FROM users WHERE id = 1; DROP TABLE users; --
```

**Prepared Statements (proteção):**

```javascript
// SEGURO
const query = 'SELECT * FROM users WHERE id = ?';
db.get(query, [req.params.id]);
```

**Como funciona:**
1. SQL é pré-compilado com placeholders (`?`)
2. Valores são passados separadamente
3. Driver sanitiza valores automaticamente
4. Impossível injetar SQL malicioso

### 8.4 CORS (Cross-Origin Resource Sharing)

**Same-Origin Policy:**
- Browsers bloqueiam requisições entre origens diferentes
- Origem = protocolo + domínio + porta
- `http://localhost:5173` ≠ `http://localhost:3000`

**CORS headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
```

**Implementação com Express:**
```javascript
const cors = require('cors');
app.use(cors());  // Permite todas as origens
```

**Produção (mais restritivo):**
```javascript
app.use(cors({
  origin: 'https://cdaalexandre.github.io',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

### 8.5 Environment Variables

**Conceito:**
- Valores configuráveis fora do código
- Diferentes por ambiente (dev, staging, prod)
- Não commitados no Git

**Uso no Vite:**
```typescript
// Arquivo .env.local (gitignored)
VITE_API_URL=http://localhost:3000

// Código
const apiUrl = import.meta.env.VITE_API_URL;
```

**Uso no Node.js:**
```javascript
// Arquivo .env
DATABASE_URL=postgres://...

// Código (com dotenv)
require('dotenv').config();
const dbUrl = process.env.DATABASE_URL;
```

### 8.6 Continuous Deployment (CD)

**Fluxo implementado:**

```
Developer            GitHub              GitHub Actions        GitHub Pages/Render
    │                   │                       │                      │
    │── git push ──────→│                       │                      │
    │                   │── webhook ───────────→│                      │
    │                   │                       │                      │
    │                   │                       │── checkout code ───→ │
    │                   │                       │                      │
    │                   │                       │── npm install ──────→│
    │                   │                       │                      │
    │                   │                       │── npm run build ────→│
    │                   │                       │                      │
    │                   │                       │── deploy ───────────→│
    │                   │                       │                      │
    │                   │                       │←── success ──────────│
    │←── notification ──│←── status ────────────│                      │
```

**Benefícios:**
- Deploy automático a cada push
- Sem intervenção manual
- Ambiente consistente (sempre Ubuntu latest)
- Histórico de deploys rastreável

### 8.7 Monorepo vs Polyrepo

**Monorepo (usado neste projeto):**
```
crud-usuarios/
├── src/           # Frontend
├── server/        # Backend
└── package.json   # Dependências compartilhadas
```

**Vantagens:**
- Um repositório, um clone
- Compartilhar código facilmente
- Versionamento sincronizado
- Refactoring cross-repo simples

**Desvantagens:**
- Build pode ser mais lento
- CI/CD mais complexo
- Permissões granulares difíceis

**Polyrepo (alternativa):**
```
crud-usuarios-frontend/    # Repo 1
crud-usuarios-backend/     # Repo 2
```

**Quando usar polyrepo:**
- Times completamente separados
- Tecnologias muito diferentes
- Ciclos de release independentes

---

## 9. Comandos Úteis

### 9.1 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar backend e frontend simultaneamente
npm run dev:all

# Rodar apenas backend
npm run server

# Rodar apenas frontend
npm run dev

# Verificar código
npm run lint

# Build para produção
npm run build

# Testar build de produção
npm run preview
```

### 9.2 Git e GitHub

```bash
# Status do repositório
git status

# Ver mudanças não commitadas
git diff

# Adicionar arquivos ao staging
git add .
git add arquivo.js

# Commitar mudanças
git commit -m "Mensagem do commit"

# Push para GitHub
git push

# Ver histórico de commits
git log --oneline

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Ver branches
git branch -a

# Voltar para branch anterior
git checkout master
```

### 9.3 GitHub CLI

```bash
# Status de autenticação
gh auth status

# Listar repositórios
gh repo list

# Ver workflows
gh workflow list

# Ver runs de um workflow
gh run list --workflow=deploy.yml

# Ver logs de um run
gh run view <run-id>

# Disparar workflow manualmente
gh workflow run deploy.yml

# Criar issue
gh issue create

# Criar PR
gh pr create
```

### 9.4 Render (via API)

```bash
# Listar serviços
curl https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY"

# Ver status de um serviço
curl https://api.render.com/v1/services/srv-... \
  -H "Authorization: Bearer $RENDER_API_KEY"

# Disparar deploy manual
curl -X POST https://api.render.com/v1/services/srv-.../deploys \
  -H "Authorization: Bearer $RENDER_API_KEY"

# Ver logs
curl https://api.render.com/v1/services/srv-.../logs \
  -H "Authorization: Bearer $RENDER_API_KEY"
```

### 9.5 SQLite

```bash
# Abrir banco de dados
sqlite3 server/users.db

# Comandos SQL no prompt do SQLite:
.tables                    # Listar tabelas
.schema users             # Ver schema da tabela
SELECT * FROM users;      # Query
.quit                     # Sair
```

---

## 10. Próximos Passos Sugeridos

### 10.1 Melhorias de Funcionalidade

1. **Busca e Filtros**
   - Input de busca por nome/email
   - Filtros por data de criação
   - Ordenação por colunas

2. **Paginação**
   - Limitar 10 usuários por página
   - Botões anterior/próximo
   - Indicador de página atual

3. **Validações Avançadas**
   - Validar formato de email (regex)
   - Validar telefone brasileiro
   - CPF (adicionar campo e validar)
   - Idade mínima (data de nascimento)

4. **Campos Adicionais**
   - Endereço completo
   - Data de nascimento
   - CPF
   - Foto de perfil (upload)

### 10.2 Melhorias Técnicas

1. **Testes Automatizados**
   - **Frontend**: Vitest + React Testing Library
   - **Backend**: Jest + Supertest
   - **E2E**: Playwright ou Cypress

2. **TypeScript no Backend**
   - Converter `.js` para `.ts`
   - Compartilhar tipos entre frontend e backend

3. **Banco de Dados**
   - Migrar para PostgreSQL (produção)
   - Migrations (Knex.js ou Prisma)
   - Índices para performance

4. **Autenticação**
   - JWT (JSON Web Tokens)
   - Login/Logout
   - Permissões (admin vs usuário)
   - Senha hasheada (bcrypt)

5. **Performance**
   - Cache (Redis)
   - Lazy loading de componentes
   - Virtualização de listas longas
   - Service Worker (PWA)

### 10.3 Melhorias de UI/UX

1. **Design System**
   - Componentes reutilizáveis
   - Tailwind CSS ou Material-UI
   - Dark mode

2. **Feedback Visual**
   - Toasts para sucesso/erro
   - Loading skeletons
   - Animações suaves

3. **Acessibilidade**
   - ARIA labels
   - Navegação por teclado
   - Contrast ratio adequado
   - Screen reader support

4. **Responsividade**
   - Mobile-first design
   - Breakpoints otimizados
   - Touch-friendly buttons

### 10.4 DevOps e Monitoramento

1. **Monitoramento**
   - Sentry (error tracking)
   - Google Analytics
   - Uptime monitoring (UptimeRobot)

2. **CI/CD Avançado**
   - Testes automatizados no CI
   - Preview deploys para PRs
   - Semantic versioning automático

3. **Documentação**
   - JSDoc ou TSDoc
   - Storybook para componentes
   - API docs (Swagger/OpenAPI)

---

## 11. Recursos de Aprendizado

### 11.1 Documentação Oficial

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Vite**: https://vitejs.dev
- **Express**: https://expressjs.com
- **SQLite**: https://www.sqlite.org/docs.html
- **GitHub Actions**: https://docs.github.com/actions
- **Render**: https://render.com/docs

### 11.2 Tutoriais Recomendados

- **React**: Tutorial oficial do React (Tic-Tac-Toe)
- **TypeScript**: TypeScript Handbook
- **Node.js**: Node.js Getting Started Guide
- **SQL**: SQL Tutorial (W3Schools)
- **Git**: Pro Git Book (gratuito)

### 11.3 Ferramentas Úteis

- **VS Code Extensions**:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets

- **Chrome DevTools**:
  - Network tab (debug requisições)
  - React DevTools
  - Console (debug JavaScript)

---

## 12. Troubleshooting Comum

### 12.1 Backend não conecta

**Sintoma:** Frontend mostra "Erro ao carregar usuários"

**Causas possíveis:**
1. Backend não está rodando
2. Porta 3000 ocupada
3. CORS não configurado
4. URL da API incorreta

**Soluções:**
```bash
# Verificar se backend está rodando
curl http://localhost:3000

# Verificar processos na porta 3000
netstat -ano | grep :3000

# Matar processo (Windows)
taskkill /PID <pid> /F

# Reiniciar backend
npm run server
```

### 12.2 Build do frontend falha

**Sintoma:** `npm run build` retorna erro

**Causas comuns:**
1. Erros de TypeScript
2. ESLint errors
3. Imports não encontrados

**Soluções:**
```bash
# Ver erros detalhados
npm run build -- --debug

# Verificar TypeScript
npx tsc --noEmit

# Verificar ESLint
npm run lint

# Limpar cache
rm -rf node_modules/.vite
```

### 12.3 GitHub Pages mostra página em branco

**Sintoma:** Site carrega mas tela branca

**Causas:**
1. Base path incorreto no vite.config.ts
2. Assets não encontrados (404)

**Verificações:**
```typescript
// vite.config.ts deve ter:
base: '/crud-usuarios/',  // Nome do repo

// Console do browser (F12):
// Deve NÃO ter erros 404
```

### 12.4 Render hiberna muito rápido

**Sintoma:** Primeira requisição sempre demora ~30s

**Causa:** Plano free hiberna após 15min

**Soluções:**
1. **Upgrade para plano pago** ($7/mês)
2. **Cron job** para pingar a cada 10 minutos
3. **UptimeRobot** (gratuito, pinga a cada 5min)

```javascript
// Cron job simples (separado)
setInterval(() => {
  fetch('https://crud-usuarios-api-65jm.onrender.com');
}, 10 * 60 * 1000);  // 10 minutos
```

---

## 13. Glossário

- **API** (Application Programming Interface): Interface para comunicação entre sistemas
- **CRUD**: Create, Read, Update, Delete
- **REST**: Representational State Transfer
- **SPA** (Single Page Application): App que carrega uma única página HTML
- **SSR** (Server-Side Rendering): Renderização no servidor
- **CSR** (Client-Side Rendering): Renderização no cliente
- **Middleware**: Função que processa requisições antes do handler final
- **Hook** (React): Função que permite usar features do React em componentes funcionais
- **Props**: Propriedades passadas para componentes React
- **State**: Dados que mudam ao longo do tempo em um componente
- **Build**: Processo de compilação de código para produção
- **Bundle**: Arquivo único contendo todo código compilado
- **Hot Module Replacement (HMR)**: Atualização de módulos sem reload completo
- **Linter**: Ferramenta que analisa código para encontrar erros
- **Transpiler**: Converte código de uma linguagem para outra (TS → JS)
- **Deployment**: Processo de publicar aplicação em produção
- **Environment**: Conjunto de configurações (dev, staging, prod)
- **Migration**: Script que modifica schema do banco de dados
- **Seed**: Dados iniciais para popular banco de dados
- **ORM** (Object-Relational Mapping): Camada de abstração sobre SQL
- **JWT** (JSON Web Token): Token para autenticação stateless
- **HTTPS**: HTTP com criptografia TLS/SSL
- **DNS**: Domain Name System (traduz domínios para IPs)
- **CDN** (Content Delivery Network): Rede distribuída de servidores
- **Latency**: Tempo de resposta de uma requisição
- **Throughput**: Quantidade de requisições processadas por segundo

---

## Conclusão

Este documento captura todo o processo de criação do CRUD de Usuários, desde o repositório vazio até o deploy em produção. Cada decisão técnica foi explicada com conceitos e trade-offs considerados.

**Resumo do que foi criado:**
- ✅ Frontend React + TypeScript + Vite
- ✅ Backend Node.js + Express + SQLite
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Deploy automatizado (GitHub Actions + Render)
- ✅ Segurança (credenciais protegidas)
- ✅ Documentação completa (CLAUDE.md, README.md, NOTES.md)

**URLs finais:**
- **Aplicação**: https://cdaalexandre.github.io/crud-usuarios/
- **API**: https://crud-usuarios-api-65jm.onrender.com
- **Código**: https://github.com/cdaalexandre/crud-usuarios

**Mantido por:** Alexandre Calzetta (cdaalexandre)
**Data:** 16 de fevereiro de 2026
**Versão:** 1.0.0
