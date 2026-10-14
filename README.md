# GitLoom Frontend

<p align="center">
  <strong>A modern React interface for exploring GitHub repositories and chatting with your codebase.</strong>
  <br />
  <a href="https://gitloom.netlify.app/">Live application</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/Flying-vipul/GitLoom">Backend repository</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES202x-F7DF1E?logo=javascript&logoColor=black" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
</p>

## Overview

GitLoom Frontend is the React single-page application for **GitLoom**, an AI-powered GitHub codebase assistant. It provides the user interface for signing in with GitHub, browsing repositories, viewing indexing progress, and asking questions about a repository through a streaming chat experience.

The frontend communicates with the Spring Boot API in the [GitLoom backend repository](https://github.com/Flying-vipul/GitLoom). Authentication uses a server-side session and a credentialed browser request; it is not a JWT-based frontend flow.

**Live demo:** [https://gitloom.netlify.app/](https://gitloom.netlify.app/)

## What’s included

- **GitHub sign-in flow** — redirects users to the backend's GitHub OAuth authorization endpoint and handles the authentication callback.
- **Protected application routes** — routes under `/app` require an authenticated user.
- **Repository views** — repository list, repository details, indexing status, and indexing actions.
- **AI chat interface** — repository-scoped chat sessions, message history, and streaming responses using Server-Sent Events.
- **Dashboard and account pages** — dashboard, documents, profile, and settings interfaces.
- **Shared application layout** — navigation, sidebar, mobile navigation, reusable components, and theme context.
- **API integration layer** — Axios client with credentials enabled and centralized handling for HTTP 401 responses.
- **Client-side data handling** — TanStack Query configuration for caching and retry behavior.
- **Single-page app routing** — Netlify redirect configuration forwards application paths to `index.html`.

> Note: the availability of each screen and operation depends on the deployed backend and its configured API endpoints, credentials, and provider services.

## Technology stack

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| Vite 8 | Local development server and production bundler |
| JavaScript (ES modules) | Frontend application logic |
| React Router 7 | Client-side routing and protected pages |
| TanStack Query | Server-state caching and fetching defaults |
| Axios | REST API requests and response interceptors |
| Tailwind CSS | Styling utilities and frontend styling workflow |
| React Hook Form + Zod | Form state and schema validation dependencies |
| React Markdown | Rendering Markdown responses |
| Remark GFM + rehype-highlight | GitHub-Flavored Markdown and code highlighting support |
| Sonner | Toast notifications |
| Lucide React | Interface icons |
| ESLint | Code linting |
| Netlify | Frontend hosting |

## Application structure

```text
src/
├── api/                  # Authentication, chat, document, repository and HTTP clients
├── assets/               # Static assets used by the application
├── auth/                 # Auth provider and protected-route logic
├── components/
│   ├── layout/           # App shell, header, sidebar and mobile navigation
│   ├── repositories/     # Repository cards, filters, progress and status UI
│   └── ui/               # Reusable UI elements
├── context/              # Shared theme context
├── pages/
│   ├── app/              # Dashboard, chat, documents, profile, settings and repositories
│   ├── AuthCallbackPage.jsx
│   ├── LandingPage.jsx
│   └── LoginPage.jsx
├── App.jsx               # Routes and application-level providers
├── index.css             # Global styles
└── main.jsx              # React entry point
```

## Run locally

### Prerequisites

- Node.js (a current LTS release is recommended)
- npm
- Access to a running GitLoom backend

### 1. Clone the repository

```bash
git clone https://github.com/Flying-vipul/GitLoom-Frontend.git
cd GitLoom-Frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the backend URL

Create a local `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Set the value to the base URL of your deployed backend when using a remote environment. `VITE_API_BASE_URL` is required by the API client and authentication flow.

Only put public configuration in variables prefixed with `VITE_`: Vite exposes these values to browser code. Never put API secrets, database credentials, OAuth client secrets, or other private values in frontend environment variables.

### 4. Start the development server

```bash
npm run dev
```

Vite prints the local URL in the terminal, commonly `http://localhost:5173`.

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local Vite development server |
| `npm run lint` | Run ESLint checks |
| `npm run build` | Build the production frontend into `dist/` |
| `npm run preview` | Preview the production build locally |

Before deploying, run:

```bash
npm run lint
npm run build
```

## Backend integration

The frontend expects the Spring Boot backend to provide the API routes it consumes. Configure `VITE_API_BASE_URL` to point to that API.

- **Backend source:** [Flying-vipul/GitLoom](https://github.com/Flying-vipul/GitLoom)
- **Live frontend:** [gitloom.netlify.app](https://gitloom.netlify.app/)

The browser sends requests with credentials so the backend session cookie can authenticate protected requests. The backend must allow the frontend origin through CORS and configure its OAuth success/failure redirects for the deployed frontend. For local and production environments, verify the backend's `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, GitHub OAuth callback URL, cookie settings, and HTTPS configuration.

The chat interface streams responses over an authenticated `POST` request that expects Server-Sent Events. This uses `fetch` and a readable response stream rather than the native `EventSource` API because the request includes a JSON body and credentials.

## Deployment

The frontend is deployed at [https://gitloom.netlify.app/](https://gitloom.netlify.app/).

For a new deployment in Netlify, use these typical settings:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variable:** `VITE_API_BASE_URL` set to the deployed backend base URL

Keep the SPA redirect rule in `public/_redirects` so direct navigation to client-side routes resolves through `index.html`. After deployment, verify GitHub OAuth redirect behavior, backend CORS configuration, session cookies, and chat streaming from the production URL.

## Security reminders

- Keep `.env` and local credentials out of Git.
- Do not store private API keys or OAuth client secrets in frontend code or `VITE_*` variables.
- Configure secrets on the backend hosting platform, where they are not exposed to browsers.
- Review OAuth scopes and backend permissions independently of the frontend UI.

## Related project

GitLoom's backend handles GitHub OAuth, repository indexing, retrieval-augmented generation (RAG), vector search, and AI chat orchestration. See the [backend repository](https://github.com/Flying-vipul/GitLoom) for its source and setup instructions.

## License

No license file is currently included in this repository. Until a license is added, do not assume the code is licensed for reuse or redistribution.
