# Pitch Perfect V2

Pitch Perfect V2 is a comprehensive monorepo project built on the [Open Canvas](https://opencanvas.langchain.com) architecture. It integrates a powerful web application with advanced agentic capabilities, designed to assist with pitch generation and refusal handling.

## 🏗 Architecture Overview

The project follows a Monorepo structure managed by [Turborepo](https://turbo.build/repo):

### Apps
- **`apps/web`**: The primary Next.js web application. It handles the UI, routing, and user interaction.
- **`apps/agents`**: Contains the backend agent logic, powered by LangGraph and various LLM integrations (OpenAI, Anthropic, etc.).

### Packages
- **`packages/shared`**: Shared utilities and types used across applications.
- **`packages/firebase-utils`**: Common Firebase interaction utilities.

## 🛠 Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (Project uses `yarn` for package management)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (Optional, but recommended for running local services if applicable)

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd pitch-perfect-v2-public
yarn install
```

### 2. Environment Setup

Copy the example environment file and configure your keys:

```bash
cp .env.example .env
```

You will need to populate the `.env` file with valid API keys for:
- OpenAI / Anthropic
- Firebase
- Supabase
- LangSmith (for tracing)

### 3. Running the Project

To start the development server for the web application:

```bash
cd apps/web
yarn dev
```

This will typically spin up the web app on `http://localhost:3000`.

To start the development server for the agents:

```bash
cd apps/agents
yarn dev
```

To build the project:

```bash
cd apps/web
yarn build
```

To build the agents:

```bash
cd apps/agents
yarn build
```

## 📜 Available Scripts

Run these scripts from the root directory:

- **`yarn build`**: Builds all applications and packages.
- **`yarn dev`**: Starts the development environment (defaulting often to the web app).
- **`yarn lint`**: Runs linting across the workspaces.
- **`yarn format`**: Formats code using Prettier.
- **`yarn test`**: Runs tests (configured via Jest/Vitest).

## 🧰 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **AI/Agents**: [LangGraph](https://langchain-ai.github.io/langgraph/), [LangChain](https://js.langchain.com/)
- **Database/Auth**: [Firebase](https://firebase.google.com/), [Supabase](https://supabase.com/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Monorepo**: [Turborepo](https://turbo.build/)

## 📚 Documentation

For more detailed system documentation, please refer to the `docs/` directory:
- [Agent System Documentation](docs/agent-system-documentation.md)
- [Technical Design](docs/agentic-system-technical-design.md)
- [Pitch Generation Workflow](docs/pitch-generation-workflow.md)
